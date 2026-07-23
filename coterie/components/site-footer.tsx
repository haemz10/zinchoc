// One quiet row — apps don't have big footers.
export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-cream">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink/45 sm:flex-row">
        <p>© 2026 Coterie</p>
        <div className="flex gap-4">
          <a href="/legal" className="hover:text-ink">
            Privacy
          </a>
          <a href="/legal" className="hover:text-ink">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
