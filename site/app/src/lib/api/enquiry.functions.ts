import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getDb, insertEnquiry } from "../data.server";

// Public enquiry submission. Validated server-side; inserts into the enquiries
// table. Returns a friendly result object rather than throwing so the form can
// render inline field errors and a composed success state.

const EnquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional().default(""),
  event_date: z.string().trim().max(40).optional().default(""),
  guest_count: z.string().trim().max(20).optional().default(""),
  product_slug: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1, "Please add a short note about your day.").max(4000),
  consent: z.boolean(),
  // Honeypot: real people leave this empty.
  company: z.string().optional().default(""),
});

export type EnquiryResult =
  | { ok: true }
  | { ok: false; formError?: string; errors?: Record<string, string> };

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => EnquirySchema.parse(data))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    // Honeypot tripped: pretend success, store nothing.
    if (data.company && data.company.trim().length > 0) {
      return { ok: true };
    }

    if (!data.consent) {
      return {
        ok: false,
        errors: { consent: "Please agree to the privacy policy so we can reply." },
      };
    }

    if (!getDb()) {
      return {
        ok: false,
        formError:
          "Our enquiry form is not connected just yet. Please email us and we will reply within two business days.",
      };
    }

    const guestCount = data.guest_count ? Number.parseInt(data.guest_count, 10) : NaN;

    try {
      await insertEnquiry({
        name: data.name,
        email: data.email,
        phone: data.phone ? data.phone : null,
        event_date: data.event_date ? data.event_date : null,
        guest_count: Number.isFinite(guestCount) ? guestCount : null,
        product_slug: data.product_slug ? data.product_slug : null,
        message: data.message,
        consent_at: new Date().toISOString(),
      });
      return { ok: true };
    } catch {
      return {
        ok: false,
        formError: "Something went wrong sending your enquiry. Please try again or email us.",
      };
    }
  });
