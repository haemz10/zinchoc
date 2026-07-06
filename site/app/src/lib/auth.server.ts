// Server-only admin authentication. Password compare is timing-safe; the
// session cookie is an HMAC-signed token (httpOnly, Secure, SameSite=Lax,
// 7-day expiry). Rate limiting is backed by the admin_attempts table.
import { bindings } from "./bindings.server";
import { getDb, getSettingValue } from "./data.server";

const COOKIE_NAME = "zc_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILED = 5;
const WINDOW_MINUTES = 15;

/** Admin login is offered when either the ADMIN_PASSWORD env secret is set or
 * the owner has stored a password hash via admin Settings. */
export async function adminConfigured(): Promise<boolean> {
  const pw = bindings().ADMIN_PASSWORD;
  if (typeof pw === "string" && pw.length > 0) return true;
  const hash = await getSettingValue("admin_password_hash");
  return hash.length > 0;
}

function sessionSecret(): string {
  const { SESSION_SECRET, ADMIN_PASSWORD } = bindings();
  // Fall back to a value derived from the admin password when no dedicated
  // session secret is set (still server-only, never shipped to the client).
  return SESSION_SECRET && SESSION_SECRET.length > 0
    ? SESSION_SECRET
    : `zc-session:${ADMIN_PASSWORD ?? ""}`;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncodeStr(str: string): string {
  return b64urlEncode(new TextEncoder().encode(str));
}

async function hmac(message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

// Constant-time comparison (portable across workerd and Node dev; the
// Workers-only crypto.subtle.timingSafeEqual is not in the DOM type lib).
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

/** SHA-256 hex of password + session secret salt (WebCrypto, server-only). */
export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password + sessionSecret()),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Timing-safe check of the submitted password. The owner-set hash stored in
 * settings (admin_password_hash) wins; the ADMIN_PASSWORD env secret is the
 * fallback while no hash is stored. */
export async function checkPassword(input: string): Promise<boolean> {
  const storedHash = await getSettingValue("admin_password_hash");
  if (storedHash) {
    const inputHash = await hashPassword(input);
    return timingSafeEqual(inputHash, storedHash);
  }
  const pw = bindings().ADMIN_PASSWORD;
  if (!pw) return false;
  return timingSafeEqual(input, pw);
}

/** Build the signed session token: base64url(payload).base64url(sig). */
async function signToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = b64urlEncodeStr(payload);
  const sig = b64urlEncode(await hmac(payloadB64));
  return `${payloadB64}.${sig}`;
}

async function verifyToken(token: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = b64urlEncode(await hmac(payloadB64));
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(json) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function createSessionCookie(): Promise<string> {
  const token = await signToken();
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) return part.slice(eq + 1).trim();
  }
  return null;
}

/** Verify the session cookie on the incoming request. */
export async function isAuthed(request: Request): Promise<boolean> {
  if (!(await adminConfigured())) return false;
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  return verifyToken(token);
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Count failed login attempts for this IP inside the rate-limit window. */
export async function recentFailedAttempts(ip: string): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  try {
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS n FROM admin_attempts WHERE ip = ? AND created_at > datetime('now', ?)`,
      )
      .bind(ip, `-${WINDOW_MINUTES} minutes`)
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.prepare("INSERT INTO admin_attempts (ip) VALUES (?)").bind(ip).run();
  } catch {
    // best effort; never block the request path on the rate-limit log
  }
}

export async function clearAttempts(ip: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await db.prepare("DELETE FROM admin_attempts WHERE ip = ?").bind(ip).run();
  } catch {
    // best effort
  }
}

export const RATE_LIMIT = { MAX_FAILED, WINDOW_MINUTES };
