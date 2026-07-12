import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="font-serif text-6xl font-semibold text-clay">404</span>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
          This page wandered off
        </h1>
        <p className="mt-2 max-w-sm text-ink/60">
          The page you&apos;re looking for doesn&apos;t exist, or it may have
          been removed by its owner.
        </p>
        <a
          href="/"
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          Back to home
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
