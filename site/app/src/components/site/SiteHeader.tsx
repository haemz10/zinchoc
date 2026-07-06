import { useState } from "react";

import type { Settings } from "../../lib/types";
import { HeartEyeMark } from "./HeartEyeMark";
import { PrimaryCta } from "./PrimaryCta";

// Site header: brand mark + wordmark, a single line of navigation (<=80px tall),
// the primary CTA, and an explicit mobile menu. Anchor links use "/#id" so they
// resolve from any page. Announcement line renders only when set in settings.

type NavItem = { href: string; label: string; faqOnly?: boolean; galleryOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/#collection", label: "The collection" },
  { href: "/gallery", label: "Gallery", galleryOnly: true },
  { href: "/#process", label: "How it works" },
  { href: "/faq", label: "FAQ", faqOnly: true },
];

export function SiteHeader({
  settings,
  showFaq = true,
  showGallery = true,
}: {
  settings: Settings;
  showFaq?: boolean;
  showGallery?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const announcement = settings.announcement?.trim();
  const nav = NAV.filter(
    (item) => (showFaq || !item.faqOnly) && (showGallery || !item.galleryOnly),
  );

  return (
    <header className="sticky top-0 z-50">
      {announcement ? (
        <div className="bg-ink text-beige">
          <p className="mx-auto max-w-6xl px-5 py-2 text-center font-body text-xs tracking-wide">
            {announcement}
          </p>
        </div>
      ) : null}
      <div className="border-b border-silver/40 bg-beige/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5">
          <a href="/" className="flex items-center gap-3" aria-label="Zin Choc home">
            {settings.logo_image_key ? (
              <img
                src={`/img/${settings.logo_image_key}`}
                alt="Zin Choc"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <HeartEyeMark variant="ink" className="h-8 w-8" />
            )}
            <span className="font-display text-lg uppercase tracking-[0.28em] text-ink">
              Zin Choc
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-body text-sm tracking-wide text-ink/80 transition-colors hover:text-gold"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <PrimaryCta size="sm" />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? (
                <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16 M4 12h16 M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open ? (
          <div id="mobile-menu" className="border-t border-silver/40 bg-beige md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="py-2 font-body text-base text-ink/90"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3">
                <PrimaryCta size="sm" className="w-full" />
              </div>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
