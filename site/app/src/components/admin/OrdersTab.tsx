import { Fragment, useCallback, useEffect, useState } from "react";

import {
  adminListOrders,
  adminMarkOrderReminded,
  adminSetOrderDeleted,
  adminSetOrderStatus,
} from "../../lib/api/admin.functions";
import { formatAud, ORDER_STATUSES, type Order, type OrderStatus } from "../../lib/types";

// Admin orders tab: newest first with reference, product, quantity, total,
// customer, contact, a status dropdown, expandable notes, and CSV export.
// Pending orders get a one-time email reminder (opens the owner's mail app
// pre-written, then locks); every order can be deleted (soft) and restored.

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

function reminderMailto(order: Order): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const subject = `Your Zin Choc order ${order.reference} - payment reminder`;
  const body = [
    `Hello ${order.customer_name},`,
    "",
    `A friendly reminder that your Zin Choc order is reserved and awaiting payment:`,
    "",
    `  Order reference: ${order.reference}`,
    `  Piece: ${order.product_name} x ${order.quantity}`,
    `  Total (includes GST): ${formatAud(order.total_cents)}`,
    "",
    `You can pay securely by card or PayPal here:`,
    `  ${origin}/order/thank-you?ref=${encodeURIComponent(order.reference)}`,
    "",
    `Prefer bank transfer or an emailed tax invoice? Just reply to this email and we will arrange it.`,
    "",
    `Once payment clears we confirm your order and schedule production.`,
    "",
    `Warm regards,`,
    `Zin Choc`,
  ].join("\n");
  return `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

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
    setNotice("");
    try {
      await adminSetOrderStatus({ data: { id: order.id, status } });
    } catch {
      setNotice("Could not update the order status. Please try again.");
    }
    await refresh();
  }

  async function sendReminder(order: Order) {
    setNotice("");
    // Open the pre-written email first (popup blockers allow it inside the
    // click), then record the one-time send server-side.
    window.location.href = reminderMailto(order);
    try {
      const res = await adminMarkOrderReminded({ data: { id: order.id } });
      if (!res.ok) setNotice(res.error);
    } catch {
      setNotice("Could not record the reminder. Please try again.");
    }
    await refresh();
  }

  async function setDeleted(order: Order, deleted: boolean) {
    setNotice("");
    if (
      deleted &&
      !window.confirm(
        `Delete order ${order.reference}? It moves to Deleted orders below, where you can restore it at any time.`,
      )
    ) {
      return;
    }
    try {
      await adminSetOrderDeleted({ data: { id: order.id, deleted } });
      if (deleted)
        setNotice(`Order ${order.reference} deleted. Restore it from Deleted orders below.`);
    } catch {
      setNotice("Could not update the order. Please try again.");
    }
    await refresh();
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading orders...</p>;
  }

  const active = orders.filter((o) => !o.deleted_at);
  const deleted = orders.filter((o) => o.deleted_at);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Orders</h2>
        <a href="/api/admin/orders/csv" className={`${btn} bg-ink text-beige`} download>
          Export CSV
        </a>
      </div>

      {notice ? (
        <p className="mt-4 rounded-sm border border-gold/40 bg-gold/10 px-4 py-2.5 font-body text-sm text-ink">
          {notice}
        </p>
      ) : null}

      {active.length === 0 ? (
        <p className="mt-5 rounded-sm border border-ink/15 bg-white p-5 font-body text-sm text-ink/60">
          No orders yet. New orders from the website will appear here.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-sm border border-ink/15 bg-white">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/15">
                {[
                  "Received",
                  "Reference",
                  "Piece",
                  "Qty",
                  "Total",
                  "Customer",
                  "Contact",
                  "Payment",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-wide text-ink/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map((o) => (
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
                      <a
                        href={`mailto:${o.email}`}
                        className="underline decoration-gold underline-offset-2"
                      >
                        {o.email}
                      </a>
                      {o.phone ? (
                        <span className="block text-xs text-ink/55">{o.phone}</span>
                      ) : null}
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
                      <div className="flex flex-wrap items-center gap-2">
                        {o.status === "pending_payment" ? (
                          o.reminder_sent_at ? (
                            <span
                              className="inline-flex items-center rounded-sm bg-ink/5 px-3 py-1.5 font-body text-xs text-ink/55"
                              title={`Reminder sent ${o.reminder_sent_at}`}
                            >
                              Reminded
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sendReminder(o)}
                              className={`${btn} bg-gold/90 text-ink`}
                              title="Opens a pre-written payment reminder in your email app. Can be sent once per order."
                            >
                              Email reminder
                            </button>
                          )
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setOpenId(openId === o.id ? null : o.id)}
                          className={`${btn} border border-ink/25 text-ink`}
                          aria-expanded={openId === o.id}
                        >
                          {openId === o.id ? "Hide" : "Details"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleted(o, true)}
                          className={`${btn} border border-[#8a2f2f]/40 text-[#8a2f2f]`}
                        >
                          Delete
                        </button>
                      </div>
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
                        {o.reminder_sent_at ? (
                          <p className="mt-1 font-body text-xs text-ink/50">
                            Payment reminder sent {o.reminder_sent_at}
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

      {deleted.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-display text-lg text-ink/70">Deleted orders</h3>
          <p className="mt-1 font-body text-xs text-ink/55">
            Deleted orders are kept here so nothing is lost. Restore returns an order to the list
            above.
          </p>
          <ul className="mt-3 divide-y divide-ink/10 rounded-sm border border-ink/15 bg-white">
            {deleted.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <span className="font-body text-sm text-ink/70">
                  <span className="font-semibold tracking-wide text-ink/80">{o.reference}</span>
                  {" - "}
                  {o.product_name} x {o.quantity}, {formatAud(o.total_cents)}, {o.customer_name}
                  <span className="block text-xs text-ink/50">Deleted {o.deleted_at}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDeleted(o, false)}
                  className={`${btn} border border-ink/25 text-ink`}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
