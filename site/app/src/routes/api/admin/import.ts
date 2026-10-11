import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../lib/auth.server";
import { getBucket, getDb } from "../../../lib/data.server";

// Admin-authed one-shot content import for the site rename. Two modes:
//  - direct: the request body carries the export payload (from the source
//    site's /api/admin/export) plus base64 images. Used because Cloudflare
//    Workers cannot fetch sibling *.higgsfield.app hosts (same-zone limit).
//  - pull: given source_origin + source_password, log in to the source and
//    fetch its export server-to-server (works only across zones).
// Existing local content is REPLACED, so the caller must send
// confirm: "REPLACE".

const SOURCE_RE = /^https:\/\/[a-z0-9-]+\.higgsfield(-dev)?\.app$/;

type ExportPayload = {
  ok: boolean;
  data?: Record<string, Record<string, unknown>[]>;
};

type ImportBody = {
  confirm?: string;
  payload?: ExportPayload;
  images?: Record<string, { content_type?: string; base64?: string }>;
  source_origin?: string;
  source_password?: string;
};

function columnsOf(row: Record<string, unknown>): string[] {
  return Object.keys(row);
}

function b64decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function loginToSource(source: string, password: string): Promise<string | null> {
  const form = new URLSearchParams();
  form.set("password", password);
  const res = await fetch(`${source}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "manual",
  });
  const location = res.headers.get("location") ?? "";
  if (location.includes("error=")) return null;
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/zc_admin=[^;]+/);
  return match ? match[0] : null;
}

async function pullFromSource(source: string, password: string): Promise<ExportPayload | null> {
  const cookie = await loginToSource(source, password);
  if (!cookie) return null;
  const exportRes = await fetch(`${source}/api/admin/export`, { headers: { Cookie: cookie } });
  if (!exportRes.ok) return null;
  return (await exportRes.json()) as ExportPayload;
}

export const Route = createFileRoute("/api/admin/import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const db = getDb();
        const bucket = getBucket();
        if (!db) {
          return Response.json({ ok: false, error: "Database not provisioned." }, { status: 503 });
        }

        let body: ImportBody;
        try {
          body = (await request.json()) as ImportBody;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
        }
        if (body.confirm !== "REPLACE") {
          return Response.json(
            { ok: false, error: 'Set confirm: "REPLACE" to overwrite this site\'s content.' },
            { status: 400 },
          );
        }

        let payload: ExportPayload | null = body.payload ?? null;
        const source = (body.source_origin ?? "").replace(/\/+$/, "");
        if (!payload) {
          if (!SOURCE_RE.test(source)) {
            return Response.json(
              {
                ok: false,
                error:
                  "Provide payload directly, or source_origin as an https://<slug>.higgsfield.app URL.",
              },
              { status: 400 },
            );
          }
          try {
            payload = await pullFromSource(source, body.source_password ?? "");
          } catch (error) {
            return Response.json(
              {
                ok: false,
                error: `Could not reach the source site: ${error instanceof Error ? error.message : "fetch failed"}`,
              },
              { status: 502 },
            );
          }
        }
        if (!payload || !payload.ok || !payload.data) {
          return Response.json(
            { ok: false, error: "Source export returned no data." },
            { status: 502 },
          );
        }

        // Replace table contents. Explicit column lists keep ids (and order
        // references) identical.
        const counts: Record<string, number> = {};
        for (const [table, rows] of Object.entries(payload.data)) {
          if (!/^[a-z_]+$/.test(table)) continue;
          const statements = [db.prepare(`DELETE FROM ${table}`)];
          for (const row of rows) {
            const cols = columnsOf(row);
            if (cols.length === 0 || !cols.every((c) => /^[a-z0-9_]+$/.test(c))) continue;
            statements.push(
              db
                .prepare(
                  `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
                )
                .bind(...cols.map((c) => (row[c] === undefined ? null : row[c]))),
            );
          }
          await db.batch(statements);
          counts[table] = rows.length;
        }

        // Store images: direct base64 uploads first, then (pull mode only)
        // fetch any remaining referenced keys from the source's public /img.
        const images: Record<string, string> = {};
        const wanted = new Set<string>();
        for (const row of payload.data.products ?? []) {
          if (typeof row.image_key === "string" && row.image_key) wanted.add(row.image_key);
        }
        for (const row of payload.data.gallery_images ?? []) {
          if (typeof row.image_key === "string" && row.image_key) wanted.add(row.image_key);
        }
        for (const row of payload.data.settings ?? []) {
          const k = typeof row.key === "string" ? row.key : "";
          const v = typeof row.value === "string" ? row.value : "";
          if (k.endsWith("_image_key") && v) wanted.add(v);
        }

        if (bucket) {
          for (const [key, file] of Object.entries(body.images ?? {})) {
            if (!key || key.includes("..") || !file.base64) continue;
            try {
              const bytes = b64decode(file.base64);
              await bucket.put(key, bytes.buffer as ArrayBuffer, {
                httpMetadata: { contentType: file.content_type ?? "application/octet-stream" },
              });
              images[key] = `uploaded (${bytes.byteLength} bytes)`;
              wanted.delete(key);
            } catch (error) {
              images[key] = error instanceof Error ? `error: ${error.message}` : "error";
            }
          }
          for (const key of wanted) {
            try {
              const existing = await bucket.head(key);
              if (existing) {
                images[key] = "already present";
                continue;
              }
              if (!SOURCE_RE.test(source)) {
                images[key] = "missing (no source to fetch from)";
                continue;
              }
              const res = await fetch(`${source}/img/${key}`);
              if (!res.ok) {
                images[key] = `fetch failed: HTTP ${res.status}`;
                continue;
              }
              const bytes = await res.arrayBuffer();
              await bucket.put(key, bytes, {
                httpMetadata: {
                  contentType: res.headers.get("content-type") ?? "application/octet-stream",
                },
              });
              images[key] = `copied (${bytes.byteLength} bytes)`;
            } catch (error) {
              images[key] = error instanceof Error ? `error: ${error.message}` : "error";
            }
          }
        }

        return Response.json({ ok: true, counts, images });
      },
    },
  },
});
