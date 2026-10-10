import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../lib/auth.server";
import { stripeDiagnostics } from "../../../lib/stripe.server";

// Admin-authed Stripe connectivity diagnostic. Returns the per-key results
// (full status/code/message, never the keys themselves) plus a no-auth probe
// that distinguishes "the key is wrong" from "the platform cannot reach
// api.stripe.com at all": an unauthenticated request must come back as a
// Stripe-shaped 401; anything else means the egress path itself is broken.

export const Route = createFileRoute("/api/admin/stripe-test")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const origin = new URL(request.url).origin;

        // Fixed allowlist of probe targets (never user input): payment hosts
        // the site depends on plus a neutral reference host, to tell a
        // Stripe-specific block apart from all egress being closed.
        const PROBE_URLS = [
          "https://api.stripe.com/v1/checkout/sessions",
          "https://checkout.stripe.com/",
          "https://www.paypal.com/",
          "https://example.com/",
        ];
        const probe: Record<string, unknown> = {};
        for (const target of PROBE_URLS) {
          try {
            const res = await fetch(target, { method: "GET" });
            probe[target] = { status: res.status, body: (await res.text()).slice(0, 120) };
          } catch (error) {
            probe[target] = { error: error instanceof Error ? error.message : String(error) };
          }
        }

        const diagnostics = await stripeDiagnostics(origin);
        return Response.json(
          { ok: true, probe, diagnostics },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
