import type { Settings } from "../../lib/types";
import { HeartEyeMark } from "./HeartEyeMark";

// Footer: brand mark + wordmark, Instagram icon link (from settings), ABN
// (from settings so admin edits propagate), legal links, copyright. The email
// icon/mailto is intentionally omitted until the owner assigns a business
// address; the contact email shows as plain text.

export function SiteFooter({
  settings,
  showFaq = true,
}: {
  settings: Settings;
  showFaq?: boolean;
}) {
  const year = new Date().getFullYear();
  // Each information page has its own admin visibility switch; hidden pages
  // drop out of the footer (their content stays saved in admin Pages).
  const links = [
    { href: "/faq", label: "FAQ", visible: showFaq },
    { href: "/privacy", label: "Privacy", visible: settings.show_page_privacy !== "0" },
    { href: "/terms", label: "Terms of sale", visible: settings.show_page_terms !== "0" },
    {
      href: "/shipping-refunds",
      label: "Shipping and refunds",
      visible: settings.show_page_shipping !== "0",
    },
  ].filter((item) => item.visible);
  return (
    <footer className="border-t border-silver/40 bg-panel">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              {settings.logo_image_key ? (
                <img
                  src={`/img/${settings.logo_image_key}`}
                  alt="Zin Choc"
                  className="h-9 w-9 object-contain"
                />
              ) : (
                <HeartEyeMark variant="ink" className="h-9 w-9" />
              )}
              <span className="font-display text-xl uppercase tracking-[0.28em] text-ink">
                Zin Choc
              </span>
            </div>
            <p className="mt-4 font-body text-sm leading-relaxed text-ink/70">
              {settings.footer_blurb}
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Zin Choc on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-silver/60 text-ink transition-colors hover:border-gold hover:text-gold"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                  <circle cx="12" cy="12" r="3.6" />
                  <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-ink/50">
              Information
            </span>
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-body text-sm text-ink/80 transition-colors hover:text-gold"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="font-body text-sm text-ink/70">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-ink/50">
              Contact
            </span>
            <p className="mt-3">{settings.abn}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-silver/40 pt-6">
          <p className="font-body text-xs tracking-wide text-ink/55">
            &copy; {year} {settings.business_name}. All rights reserved. Made in Australia.
          </p>
        </div>
      </div>
    </footer>
  );
}
