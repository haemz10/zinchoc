import type { Settings } from "../../lib/types";
import { PrimaryCta } from "./PrimaryCta";

// Closing invitation on the ink ground: the third and final placement of the
// primary CTA, plus the direct contact line from content-plan/home.md.

export function ClosingCta({ settings }: { settings: Settings }) {
  const instaHandle = settings.instagram_url.replace(/\/+$/, "").split("/").pop() ?? "zinchoc";
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-4xl px-5 py-24 text-center md:py-32">
        <h2 className="font-display text-3xl leading-tight text-beige md:text-5xl">
          {settings.closing_heading}
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-body text-base leading-relaxed text-beige/80">
          {settings.closing_line_1}
        </p>
        <div className="mt-9 flex justify-center">
          <PrimaryCta />
        </div>
        <p className="mt-8 font-body text-sm text-beige/70">
          Find us on Instagram at{" "}
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-beige underline decoration-gold underline-offset-4"
          >
            @{instaHandle}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
