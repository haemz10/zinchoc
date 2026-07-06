import { useId } from "react";

// Inline vector of the Zin Choc heart-and-eye mark, matching the redrawn
// official logo (app/public/assets/zinchoc-logo.svg): an asymmetric ink-navy
// heart holding a wide-open eye, the iris cropped by the upper lid with a
// white ring inside. Inline rather than <img> so it can be recoloured per
// placement: solid ink for header/footer, silver for quiet composed states,
// and a low-contrast silver outline for the oversized hero graphic.

type Variant = "ink" | "silver" | "outline";

const HEART_D =
  "M100 187 C 60 152, 22 120, 16 78 C 12 47, 31 26, 57 26 C 77 26, 92 39, 99 54 C 105 33, 124 13, 150 13 C 177 13, 193 38, 188 74 C 182 120, 140 155, 100 187 Z";
const SCLERA_D =
  "M25 91 C 48 66, 82 58, 104 60 C 132 62, 160 72, 177 88 C 166 112, 136 130, 102 130 C 68 130, 40 114, 25 91 Z";

export function HeartEyeMark({
  variant = "ink",
  className,
  title = "Zin Choc",
}: {
  variant?: Variant;
  className?: string;
  title?: string;
}) {
  const clipId = useId();

  if (variant === "outline") {
    return (
      <svg
        viewBox="0 0 200 200"
        className={className}
        role="presentation"
        aria-hidden="true"
        fill="none"
        stroke="#B9BCC2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={SCLERA_D} />
          </clipPath>
        </defs>
        <path d={HEART_D} strokeWidth={2} />
        <path d={SCLERA_D} strokeWidth={1.5} />
        <g clipPath={`url(#${clipId})`}>
          <circle cx="101" cy="82" r="32" strokeWidth={1.5} />
          <circle cx="101" cy="86" r="18" strokeWidth={1.5} />
        </g>
      </svg>
    );
  }

  const ink = variant === "silver" ? "#B9BCC2" : "#1D3241";
  const eyeWhite = variant === "silver" ? "#F3EEE5" : "#FFFFFF";

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <defs>
        <clipPath id={clipId}>
          <path d={SCLERA_D} />
        </clipPath>
      </defs>
      <path d={HEART_D} fill={ink} />
      <path d={SCLERA_D} fill={eyeWhite} />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="101" cy="82" r="32" fill={ink} />
        <circle cx="101" cy="86" r="18" fill="none" stroke={eyeWhite} strokeWidth={4} />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={
        "font-display uppercase tracking-[0.28em] leading-none text-ink" +
        (className ? ` ${className}` : "")
      }
    >
      Zin Choc
    </span>
  );
}
