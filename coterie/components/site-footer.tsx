type FooterLink = { label: string; href: string };

const platformLinks: FooterLink[] = [
  { label: "Explore", href: "/#feed" },
  { label: "Marketplace", href: "/#marketplace" },
  { label: "Communities", href: "/#communities" },
  { label: "Start a community", href: "/#communities" },
];

const companyLinks: FooterLink[] = [
  { label: "About", href: "/" },
  { label: "Privacy", href: "/legal" },
  { label: "Terms", href: "/legal" },
  { label: "Contact", href: "mailto:hello@coterie.club" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-ink text-cream">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cream font-serif text-lg leading-none text-ink">
                c
              </span>
              <span className="font-serif text-xl font-semibold">Coterie</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
              Member-owned communities, beautifully quiet. A home for the
              people and things you care about.
            </p>
          </div>

          <FooterCol title="Platform" links={platformLinks} />
          <FooterCol title="Company" links={companyLinks} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream/10 pt-6 text-sm text-cream/50 sm:flex-row sm:items-center">
          <p>© 2026 Coterie. Made with care, for members.</p>
          <div className="flex gap-5">
            <a href="/legal" className="hover:text-cream">
              Privacy
            </a>
            <a href="/legal" className="hover:text-cream">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-widest text-cream/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="text-sm text-cream/70 hover:text-cream">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
