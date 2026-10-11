import { useState } from "react";

import { createStripeCheckout } from "../../lib/api/order.functions";
import { formatAud } from "../../lib/types";

// "Pay by card" (Stripe Checkout): an ink-framed button whose frame fills from
// the left with ink on hover, label swapping to beige, with a composed loading
// state while the checkout session is created. Shared by the payment step and
// the order confirmation page (so reminder emails can link straight to it).
export function StripeCardCta({
  reference,
  totalCents,
}: {
  reference: string;
  totalCents: number;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function pay() {
    setState("loading");
    setMessage("");
    try {
      const result = await createStripeCheckout({ data: { reference } });
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setState("error");
        setMessage(result.error);
      }
    } catch {
      setState("error");
      setMessage("Card payment is temporarily unavailable, please choose another method.");
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={pay}
        disabled={state === "loading"}
        className="group relative inline-flex items-center overflow-hidden rounded-sm border border-ink px-6 py-3 font-body text-sm font-semibold text-ink transition-colors duration-300 hover:text-beige active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100"
        />
        <span className="relative z-10">
          {state === "loading"
            ? "Opening secure checkout..."
            : `Pay ${formatAud(totalCents)} by card`}
        </span>
      </button>
      {state === "error" && message ? (
        <p className="mt-2 font-body text-sm text-[#8a2f2f]">{message}</p>
      ) : null}
    </div>
  );
}
