import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../lib/auth.server";
import { getDb } from "../../../lib/data.server";

// Admin-authed full-content export, used to move this site's data to a new
// deployment (site rename). Returns every content table as JSON. Counterpart:
// /api/admin/import on the destination site, which pulls from this endpoint
// server-to-server; the data never passes through a third machine.

const TABLES = [
  "settings",
  "products",
  "product_images",
  "gallery_images",
  "faq_items",
  "legal_pages",
  "orders",
  "enquiries",
] as const;

export const Route = createFileRoute("/api/admin/export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const db = getDb();
        if (!db) {
          return Response.json({ ok: false, error: "Database not provisioned." }, { status: 503 });
        }
        const data: Record<string, unknown[]> = {};
        for (const table of TABLES) {
          const res = await db.prepare(`SELECT * FROM ${table}`).all();
          data[table] = res.results ?? [];
        }
        return Response.json(
          { ok: true, exported_at: new Date().toISOString(), data },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
