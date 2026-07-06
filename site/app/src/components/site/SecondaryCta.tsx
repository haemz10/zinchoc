// Secondary CTA: "View the collection" (hero only). Ghost text link with a
// silver hairline arrow that slides on hover and the label shifting to gold.
// Distinct garment from the primary bar and the gold submit seal.

export function SecondaryCta({
  href = "#collection",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={
        "group inline-flex items-center gap-3 font-body text-[0.95rem] tracking-wide text-ink " +
        "transition-colors duration-200 hover:text-gold active:scale-[0.98]" +
        (className ? ` ${className}` : "")
      }
    >
      <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-gold">
        View the collection
      </span>
      <svg
        viewBox="0 0 32 12"
        aria-hidden="true"
        className="h-3 w-8 overflow-visible text-silver transition-transform duration-300 ease-out group-hover:translate-x-1.5"
      >
        <line x1="0" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="1" />
        <path
          d="M24 1 L30 6 L24 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
