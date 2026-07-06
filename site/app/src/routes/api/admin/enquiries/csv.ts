import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../../lib/auth.server";
import { getEnquiries } from "../../../../lib/data.server";

// Admin-authed CSV export of the enquiries inbox (newest first).

function csvCell(value: string | number | null): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const Route = createFileRoute("/api/admin/enquiries/csv")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const enquiries = await getEnquiries();
        const header = [
          "created_at",
          "name",
          "email",
          "phone",
          "event_date",
          "guest_count",
          "product_slug",
          "message",
          "consent_at",
          "status",
        ].join(",");
        const rows = enquiries.map((e) =>
          [
            csvCell(e.created_at),
            csvCell(e.name),
            csvCell(e.email),
            csvCell(e.phone),
            csvCell(e.event_date),
            csvCell(e.guest_count),
            csvCell(e.product_slug),
            csvCell(e.message),
            csvCell(e.consent_at),
            csvCell(e.status),
          ].join(","),
        );
        const body = [header, ...rows].join("\r\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="zinchoc-enquiries.csv"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
