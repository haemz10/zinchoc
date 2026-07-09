import { replaceTokens } from "./SimpleMarkdown";
import type { FaqItem, Settings } from "../../lib/types";

// FAQ excerpt: the first four visible questions from the owner-editable
// faq_items table, as native <details>/<summary> accordion rows (works without
// client JavaScript, stays accessible). Links to the full /faq page.

export function FaqExcerpt({ items, settings }: { items: FaqItem[]; settings: Settings }) {
  return (
    <section id="questions" className="bg-panel">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-28">
        <h2 className="font-display text-3xl leading-tight text-ink md:text-5xl">Questions</h2>
        <p className="mt-5 font-body text-base leading-relaxed text-ink/75">
          A few of the things couples ask us most. The full list lives on our questions page.
        </p>

        <div className="mt-10 divide-y divide-silver/50 border-t border-silver/50">
          {items.map((item) => (
            <details key={item.id} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ink marker:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-gold transition-transform duration-200 group-open:rotate-45"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M10 4v12 M4 10h12" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-[60ch] font-body text-base leading-relaxed text-ink/75">
                {replaceTokens(item.answer, settings)}
              </p>
            </details>
          ))}
        </div>

        <a
          href="/faq"
          className="group mt-10 inline-flex items-center gap-3 font-body text-sm font-medium tracking-wide text-ink transition-colors hover:text-gold"
        >
          Read all questions
          <svg
            viewBox="0 0 32 12"
            aria-hidden="true"
            className="h-3 w-8 overflow-visible text-silver transition-transform duration-300 group-hover:translate-x-1.5"
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
      </div>
    </section>
  );
}
