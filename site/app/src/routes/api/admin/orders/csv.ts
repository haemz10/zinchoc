import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "../../../../lib/auth.server";
import { getOrders } from "../../../../lib/data.server";

// Admin-authed CSV export of orders (newest first).

function csvCell(value: string | number | null): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const Route = createFileRoute("/api/admin/orders/csv")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const orders = await getOrders();
        const header = [
          "created_at",
          "reference",
          "product_slug",
          "product_name",
          "quantity",
          "unit_price_cents",
          "total_cents",
          "customer_name",
          "email",
          "phone",
          "event_date",
          "delivery_address",
          "notes",
          "payment_method",
          "status",
          "consent_at",
        ].join(",");
        const rows = orders.map((o) =>
          [
            csvCell(o.created_at),
            csvCell(o.reference),
            csvCell(o.product_slug),
            csvCell(o.product_name),
            csvCell(o.quantity),
            csvCell(o.unit_price_cents),
            csvCell(o.total_cents),
            csvCell(o.customer_name),
            csvCell(o.email),
            csvCell(o.phone),
            csvCell(o.event_date),
            csvCell(o.delivery_address),
            csvCell(o.notes),
            csvCell(o.payment_method),
            csvCell(o.status),
            csvCell(o.consent_at),
          ].join(","),
        );
        const body = [header, ...rows].join("\r\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="zinchoc-orders.csv"',
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
