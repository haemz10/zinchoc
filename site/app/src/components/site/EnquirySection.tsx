import { useState } from "react";

import { submitEnquiry, type EnquiryResult } from "../../lib/api/enquiry.functions";
import type { Product, Settings } from "../../lib/types";

// The enquiry form: the RSVP. Full state cycle (composed idle, submitting,
// inline field errors, success). Server-validated via createServerFn, inserts
// into D1. Payment terms stated beside the form. Honeypot field for bots.

type Fields = {
  name: string;
  email: string;
  phone: string;
  event_date: string;
  guest_count: string;
  product_slug: string;
  message: string;
  consent: boolean;
  company: string; // honeypot
};

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  event_date: "",
  guest_count: "",
  product_slug: "",
  message: "",
  consent: false,
  company: "",
};

const inputClass =
  "w-full rounded-sm border border-ink/25 bg-beige px-3.5 py-2.5 font-body text-base text-ink placeholder:text-ink/35 focus:border-gold focus:outline-none";
const labelClass = "font-body text-sm font-medium text-ink";
const errorClass = "mt-1 font-body text-sm text-[#8a2f2f]";

function validate(f: Fields): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = "Please tell us your name.";
  if (!f.email.trim()) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = "Please enter a valid email address.";
  if (!f.message.trim()) e.message = "Please add a short note about your day.";
  if (!f.consent) e.consent = "Please agree to the privacy policy so we can reply.";
  return e;
}

export function EnquirySection({
  products,
  settings,
}: {
  products: Product[];
  settings: Settings;
}) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((f) => ({ ...f, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const clientErrors = validate(fields);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("submitting");
    try {
      const result: EnquiryResult = await submitEnquiry({
        data: {
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          event_date: fields.event_date,
          guest_count: fields.guest_count,
          product_slug: fields.product_slug,
          message: fields.message,
          consent: fields.consent,
          company: fields.company,
        },
      });
      if (result.ok) {
        setStatus("success");
        setFields(EMPTY);
      } else {
        setStatus("idle");
        if (result.errors) setErrors(result.errors);
        if (result.formError) setFormError(result.formError);
      }
    } catch {
      setStatus("idle");
      setFormError("Something went wrong sending your enquiry. Please try again or email us.");
    }
  }

  return (
    <section id="enquiry" className="scroll-mt-24 bg-panel">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">Your enquiry</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-5xl">
            Begin with a conversation
          </h2>
          <p className="mt-5 font-body text-base leading-relaxed text-ink/75">
            Tell us about your day. We reply within two business days, and every enquiry is read by
            the person who will make your pieces.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Form / success state */}
          <div>
            {status === "success" ? (
              <div className="rounded-sm border border-gold/40 bg-beige p-8">
                <h3 className="font-display text-2xl text-ink">Thank you, your enquiry is in.</h3>
                <p className="mt-4 font-body text-base leading-relaxed text-ink/75">
                  We have received your note and will reply within two business days. From there we
                  arrange a tasting, prepare a design proposal, and once you approve it a 50% deposit
                  secures your date.
                </p>
                <p className="mt-4 font-body text-base leading-relaxed text-ink/75">
                  If your wedding is close, feel free to email us directly at{" "}
                  <a href={`mailto:${settings.contact_email}`} className="text-ink underline decoration-gold underline-offset-4">
                    {settings.contact_email}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 font-body text-sm font-medium text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold active:scale-[0.98]"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-6">
                {formError ? (
                  <p className="rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-4 py-3 font-body text-sm text-[#8a2f2f]">
                    {formError}
                  </p>
                ) : null}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="f-name" className={labelClass}>
                      Name
                    </label>
                    <input
                      id="f-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={fields.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "e-name" : undefined}
                      className={`mt-1.5 ${inputClass}`}
                    />
                    {errors.name ? (
                      <p id="e-name" className={errorClass}>
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="f-email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="f-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={fields.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "e-email" : undefined}
                      className={`mt-1.5 ${inputClass}`}
                    />
                    {errors.email ? (
                      <p id="e-email" className={errorClass}>
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="f-phone" className={labelClass}>
                      Phone <span className="text-ink/45">(optional)</span>
                    </label>
                    <input
                      id="f-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={fields.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="f-date" className={labelClass}>
                      Wedding date <span className="text-ink/45">(optional)</span>
                    </label>
                    <input
                      id="f-date"
                      name="event_date"
                      type="date"
                      value={fields.event_date}
                      onChange={(e) => set("event_date", e.target.value)}
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="f-guests" className={labelClass}>
                      Guest count <span className="text-ink/45">(optional)</span>
                    </label>
                    <input
                      id="f-guests"
                      name="guest_count"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={fields.guest_count}
                      onChange={(e) => set("guest_count", e.target.value)}
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label htmlFor="f-piece" className={labelClass}>
                      Piece of interest
                    </label>
                    <select
                      id="f-piece"
                      name="product_slug"
                      value={fields.product_slug}
                      onChange={(e) => set("product_slug", e.target.value)}
                      className={`mt-1.5 ${inputClass}`}
                    >
                      <option value="">Not sure yet</option>
                      {products.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                      <option value="commission">A commission or new piece</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="f-message" className={labelClass}>
                    Tell us about your day
                  </label>
                  <textarea
                    id="f-message"
                    name="message"
                    rows={5}
                    value={fields.message}
                    onChange={(e) => set("message", e.target.value)}
                    required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "e-message" : undefined}
                    className={`mt-1.5 ${inputClass} resize-y`}
                  />
                  {errors.message ? (
                    <p id="e-message" className={errorClass}>
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                {/* Honeypot: visually hidden, off-screen, not announced. */}
                <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="f-company">Company</label>
                  <input
                    id="f-company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={fields.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="f-consent" className="flex items-start gap-3">
                    <input
                      id="f-consent"
                      name="consent"
                      type="checkbox"
                      checked={fields.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                      required
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={errors.consent ? "e-consent" : undefined}
                      className="mt-1 h-4 w-4 shrink-0 accent-gold"
                    />
                    <span className="font-body text-sm leading-relaxed text-ink/75">
                      I agree that Zin Choc may use the details above to respond to my enquiry, as
                      described in the{" "}
                      <a href="/privacy" className="text-ink underline decoration-gold underline-offset-4">
                        privacy policy
                      </a>
                      .
                    </span>
                  </label>
                  {errors.consent ? (
                    <p id="e-consent" className={errorClass}>
                      {errors.consent}
                    </p>
                  ) : null}
                </div>

                {/* Send enquiry: gold seal button with its own press + loading state. */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-8 py-3.5 font-body text-[0.95rem] font-semibold tracking-wide text-ink transition-transform duration-200 hover:-translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "submitting" ? (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" className="opacity-25" />
                        <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
                      </svg>
                      Sending
                    </>
                  ) : (
                    "Send enquiry"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Payment terms, stated beside the form. */}
          <aside className="rounded-sm border border-ink/15 bg-beige p-7">
            <h3 className="font-display text-xl text-ink">How payment works</h3>
            <ul className="mt-5 space-y-4 font-body text-sm leading-relaxed text-ink/75">
              <li className="border-l-2 border-gold/50 pl-4">
                A 50% deposit invoice, sent by email, secures your wedding date once you approve the
                design.
              </li>
              <li className="border-l-2 border-gold/50 pl-4">
                The balance is due two weeks before delivery.
              </li>
              <li className="border-l-2 border-gold/50 pl-4">
                Pay by bank transfer, PayPal, or by card through the invoice link. No card details
                are ever entered on this site.
              </li>
            </ul>
            <p className="mt-6 font-body text-sm leading-relaxed text-ink/65">
              All prices include GST. Delivery is quoted separately. Lead time is four to six weeks
              from design approval.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
