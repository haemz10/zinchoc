import { Fragment, useCallback, useEffect, useState } from "react";

import { adminListEnquiries, adminSetEnquiryStatus } from "../../lib/api/admin.functions";
import type { Enquiry } from "../../lib/types";

// Admin enquiries inbox: newest first, expandable message, new/replied status
// toggle, CSV export link (admin-authed server route).

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";

export function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await adminListEnquiries();
      setEnquiries(res.enquiries);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggleStatus(e: Enquiry) {
    const next = e.status === "new" ? "replied" : "new";
    await adminSetEnquiryStatus({ data: { id: e.id, status: next } });
    await refresh();
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading enquiries...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Enquiries</h2>
        <a href="/api/admin/enquiries/csv" className={`${btn} bg-ink text-beige`} download>
          Export CSV
        </a>
      </div>

      {enquiries.length === 0 ? (
        <p className="mt-5 rounded-sm border border-ink/15 bg-white p-5 font-body text-sm text-ink/60">
          No enquiries yet. New submissions from the website form will appear here.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-sm border border-ink/15 bg-white">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/15">
                {["Received", "Name", "Email", "Phone", "Event date", "Piece", "Status", ""].map(
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
              {enquiries.map((e) => (
                <Fragment key={e.id}>
                  <tr className="border-b border-ink/10 align-top">
                    <td className="px-3 py-2.5 font-body text-xs text-ink/70">{e.created_at}</td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink">{e.name}</td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink">
                      <a
                        href={`mailto:${e.email}`}
                        className="underline decoration-gold underline-offset-2"
                      >
                        {e.email}
                      </a>
                    </td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink/80">{e.phone ?? ""}</td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink/80">
                      {e.event_date ?? ""}
                      {e.guest_count ? (
                        <span className="block font-body text-xs text-ink/50">
                          {e.guest_count} guests
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 font-body text-sm text-ink/80">
                      {e.product_slug ?? ""}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleStatus(e)}
                        className={`${btn} ${
                          e.status === "new"
                            ? "bg-gold/20 text-ink"
                            : "border border-ink/20 text-ink/60"
                        }`}
                      >
                        {e.status === "new" ? "New" : "Replied"}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setOpenId(openId === e.id ? null : e.id)}
                        className={`${btn} border border-ink/25 text-ink`}
                        aria-expanded={openId === e.id}
                      >
                        {openId === e.id ? "Hide" : "Message"}
                      </button>
                    </td>
                  </tr>
                  {openId === e.id ? (
                    <tr className="border-b border-ink/10 bg-panel/60">
                      <td colSpan={8} className="px-4 py-3">
                        <p className="max-w-[80ch] whitespace-pre-wrap font-body text-sm leading-relaxed text-ink/85">
                          {e.message}
                        </p>
                        {e.consent_at ? (
                          <p className="mt-2 font-body text-xs text-ink/50">
                            Privacy consent given {e.consent_at}
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
