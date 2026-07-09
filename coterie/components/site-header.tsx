const nav = [
  { label: "Explore", href: "#feed" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Communities", href: "#communities" },
  { label: "Messages", href: "#" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream font-serif text-lg leading-none">
            c
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            Coterie
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden text-sm font-medium text-ink/70 transition-colors hover:text-ink sm:block"
          >
            Sign in
          </a>
          <a
            href="#"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
          >
            Create a community
          </a>
        </div>
      </div>
    </header>
  );
}
