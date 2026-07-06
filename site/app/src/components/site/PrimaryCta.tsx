// Primary CTA: "Enquiry" (nav, hero, closing). Bespoke chrome, not
// a shared button utility: a solid ink-navy bar with a gold hairline that sweeps
// the full width on hover, a 1px lift, and an :active press. One label, one
// intent, reused wherever the primary action appears.

export function PrimaryCta({
  href = "/#enquiry",
  className,
  size = "md",
}: {
  href?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-5 py-2.5 text-sm" : "px-7 py-3.5 text-[0.95rem]";
  return (
    <a
      href={href}
      className={
        "group relative inline-flex items-center justify-center overflow-hidden bg-ink text-beige " +
        "font-body font-medium tracking-wide transition-transform duration-200 " +
        "hover:-translate-y-px active:scale-[0.98] active:translate-y-0 " +
        pad +
        (className ? ` ${className}` : "")
      }
    >
      <span className="relative z-10">Enquiry</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-7 right-7 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </a>
  );
}
