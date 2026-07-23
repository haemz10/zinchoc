export const CURRENCIES = ["USD", "KRW", "AUD", "GBP", "JPY", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

const SYMBOL: Record<Currency, string> = {
  USD: "$",
  KRW: "₩",
  AUD: "A$",
  GBP: "£",
  JPY: "¥",
  EUR: "€",
};

// Formats a listing price. If the amount is purely numeric, prefix the currency
// symbol and add thousands separators; otherwise (e.g. "Free") show it as typed.
export function formatPrice(price: string, currency?: string | null): string {
  const cur = (currency && (CURRENCIES as readonly string[]).includes(currency)
    ? currency
    : "USD") as Currency;
  const raw = price.trim();
  const numeric = raw.replace(/[,\s]/g, "");
  if (/^\d+(\.\d+)?$/.test(numeric)) {
    const n = Number(numeric);
    const formatted = n.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
    return `${SYMBOL[cur]}${formatted}`;
  }
  return raw;
}

export function currencyLabel(c: Currency): string {
  return `${c} (${SYMBOL[c]})`;
}
