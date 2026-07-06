import { createFileRoute } from "@tanstack/react-router";

import {
  adminConfigured,
  checkPassword,
  clearAttempts,
  clientIp,
  createSessionCookie,
  RATE_LIMIT,
  recentFailedAttempts,
  recordFailedAttempt,
} from "../../../lib/auth.server";

// Admin login. Compares the submitted password (timing-safe) against the
// ADMIN_PASSWORD secret, rate limits by IP via admin_attempts, and on success
// sets the signed httpOnly session cookie. Plain form POST + redirect, so it
// works without client JavaScript.

function redirect(location: string, cookie?: string): Response {
  const headers = new Headers({ Location: location });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await adminConfigured())) return redirect("/admin");

        const ip = clientIp(request);
        const attempts = await recentFailedAttempts(ip);
        if (attempts >= RATE_LIMIT.MAX_FAILED) {
          return redirect("/admin?error=rate");
        }

        const form = await request.formData();
        const password = String(form.get("password") ?? "");

        if (password && (await checkPassword(password))) {
          await clearAttempts(ip);
          const cookie = await createSessionCookie();
          return redirect("/admin", cookie);
        }

        await recordFailedAttempt(ip);
        return redirect("/admin?error=pw");
      },
    },
  },
});
