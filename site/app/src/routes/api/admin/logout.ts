import { createFileRoute } from "@tanstack/react-router";

import { clearSessionCookie } from "../../../lib/auth.server";

// Admin logout: clears the session cookie and returns to the login screen.

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () => {
        const headers = new Headers({ Location: "/admin" });
        headers.set("Set-Cookie", clearSessionCookie());
        return new Response(null, { status: 303, headers });
      },
    },
  },
});
