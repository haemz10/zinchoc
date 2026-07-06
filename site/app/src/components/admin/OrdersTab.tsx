import { Fragment, useCallback, useEffect, useState } from "react";

import { adminListOrders, adminSetOrderStatus } from "../../lib/api/admin.functions";
import { formatAud, ORDER_STATUSES, type Order, type OrderStatus } from "../../lib/types";

// Admin orders tab: newest first with reference, product, quantity, total,
// customer, contact, a status dropdown, expandable notes, and CSV export.

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await adminListOrders();
      setOrders(res.orders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function changeStatus(order: Order, status: OrderStatus) {
    await adminSetOrderStatus({ data: { id: order.id, status } });
    await refresh();
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading orders...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Orders</h2>
        <a href="/api/admin/orders/csv" className={`${btn} bg-ink text-beige`} download>
          Export CSV
        </a>
      </div>

      {orders.length === 0 ? (
        <p className="mt-5 rounded-sm border border-ink/15 bg-white p-5 font-body text-sm text-ink/60">
          No orders yet. New orders from the website will appear here.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-sm border border-ink/15 bg-white">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/15">
                {["Received", "Reference", "Piece", "Qty", "Total", "Customer", "Contact", "Payment", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-wide text-ink/60"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr className="border-b border-ink/10 align-top">
                    <td className="px-3 py-2.5 font-body text-xs text-ink/70">{o.created_at}</td>
                    <td className="px-3 py-2.5 font-body text-sm font-semibold tracking-wide text-ink">
                      {o.reference}
                    </td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink/80">{o.product_name}</td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink/80">{o.quantity}</td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink">
                      {formatAud(o.total_cents)}
                    </td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink">{o.customer_name}</td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink/80">
                      <a href={`mailto:${o.email}`} className="underline decoration-gold underline-offset-2">
                        {o.email}
                      </a>
                      {o.phone ? <span className="block text-xs text-ink/55">{o.phone}</span> : null}
                    </td>
                    <td className="px-3 py-2.5 font-body text-xs text-ink/70">
                      {o.payment_method ?? ""}
                    </td>
                    <td className="px-3 py-2.5">
                      <label className="sr-only" htmlFor={`status-${o.id}`}>
                        Status for order {o.reference}
                      </label>
                      <select
                        id={`status-${o.id}`}
                        value={o.status}
                        onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                        className="rounded-sm border border-ink/25 bg-white px-2 py-1.5 font-body text-xs text-ink focus:border-gold focus:outline-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setOpenId(openId === o.id ? null : o.id)}
                        className={`${btn} border border-ink/25 text-ink`}
                        aria-expanded={openId === o.id}
                      >
                        {openId === o.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {openId === o.id ? (
                    <tr className="border-b border-ink/10 bg-panel/60">
                      <td colSpan={10} className="px-4 py-3">
                        <dl className="grid gap-2 font-body text-sm text-ink/85 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-ink/50">
                              Event date
                            </dt>
                            <dd>{o.event_date ?? "Not given"}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-ink/50">
                              Unit price
                            </dt>
                            <dd>{formatAud(o.unit_price_cents)}</dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-xs uppercase tracking-wide text-ink/50">
                              Delivery address
                            </dt>
                            <dd className="whitespace-pre-wrap">
                              {o.delivery_address ?? "Not given"}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-xs uppercase tracking-wide text-ink/50">Notes</dt>
                            <dd className="whitespace-pre-wrap">{o.notes ?? "None"}</dd>
                          </div>
                        </dl>
                        {o.consent_at ? (
                          <p className="mt-2 font-body text-xs text-ink/50">
                            Privacy consent given {o.consent_at}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
