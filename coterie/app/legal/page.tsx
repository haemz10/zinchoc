import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy & Terms — Coterie",
  description:
    "Coterie's privacy policy and terms of service are being drafted ahead of launch.",
};

export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-20">
        <span className="text-sm font-semibold uppercase tracking-widest text-clay">
          Legal
        </span>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
          Privacy &amp; Terms
        </h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-ink/70">
          <p>
            We&apos;re drafting our privacy policy and terms of service ahead of
            launch, with the same principle that shapes everything else here:
            members first.
          </p>
          <p>
            The short version we&apos;re committing to — no tracking for
            advertisers. Your photos, posts, and purchases belong to you, and
            we will never sell your data.
          </p>
          <p>
            The full documents will live on this page. Questions in the
            meantime?{" "}
            <a
              href="mailto:hello@coterie.club"
              className="font-semibold text-clay underline-offset-4 hover:underline"
            >
              hello@coterie.club
            </a>
          </p>
        </div>
        <a
          href="/"
          className="mt-10 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          ← Back to home
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
