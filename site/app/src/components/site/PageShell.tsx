import type { ReactNode } from "react";

import type { Settings } from "../../lib/types";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

// Shared header/footer shell for the interior pages (FAQ + legal). Keeps the
// same quiet brand chrome as the home page.

export function PageShell({
  settings,
  showFaq = true,
  showGallery = true,
  children,
}: {
  settings: Settings;
  showFaq?: boolean;
  showGallery?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader settings={settings} showFaq={showFaq} showGallery={showGallery} />
      <main className="bg-beige">{children}</main>
      <SiteFooter settings={settings} showFaq={showFaq} />
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lastUpdated,
  abn,
  intro,
}: {
  eyebrow?: string;
  title: string;
  lastUpdated?: string;
  abn?: string;
  intro?: ReactNode;
}) {
  return (
    <header className="border-b border-silver/40 bg-panel">
      <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
        {eyebrow ? (
          <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">{title}</h1>
        {abn ? <p className="mt-4 font-body text-sm text-ink/70">{`Zin Choc (${abn})`}</p> : null}
        {lastUpdated ? (
          <p className="mt-1 font-body text-sm text-ink/60">Last updated: {lastUpdated}</p>
        ) : null}
        {intro ? <div className="mt-5 max-w-[65ch] font-body text-base leading-relaxed text-ink/75">{intro}</div> : null}
      </div>
    </header>
  );
}

// Prose primitives so legal copy stays consistent without a typography plugin.
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:py-16">
      <div className="max-w-[65ch]">{children}</div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-10 font-display text-2xl text-ink first:mt-0">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 font-body text-base leading-relaxed text-ink/80">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-ink/80">
      {children}
    </ul>
  );
}
