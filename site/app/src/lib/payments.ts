/** The owner's card payment page (usually a Stripe Payment Link). For Stripe
 * links the order reference rides along as client_reference_id so the payment
 * shows up in the dashboard already matched to the order. */
export function cardPaymentLink(link: string, reference: string): string {
  const trimmed = link.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.hostname === "buy.stripe.com") {
      url.searchParams.set("client_reference_id", reference);
    }
    return url.toString();
  } catch {
    return trimmed;
  }
}
