import { HeartEyeMark } from "./HeartEyeMark";
import type { Settings } from "../../lib/types";
import { HeroImageReveal } from "./HeroImageReveal";
import { PrimaryCta } from "./PrimaryCta";
import { SecondaryCta } from "./SecondaryCta";

// Hero. With a hero image uploaded, renders the C3 mask-reveal image hero.
// Otherwise renders the composed typographic hero on the beige ground: the
// oversized heart-and-eye mark sits as a quiet low-contrast graphic on the
// right, headline and CTAs on the left. Both states are complete and
// screenshot-safe.

export function Hero({ settings }: { settings: Settings }) {
  if (settings.hero_image_key) {
    return <HeroImageReveal imageSrc={`/img/${settings.hero_image_key}`} settings={settings} />;
  }

  return (
    <section className="relative overflow-hidden bg-beige" aria-label="Zin Choc">
      {/* Oversized mark as an atmospheric graphic, partially cropped on the
          right. The uploaded brand logo replaces the built-in drawing. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 md:block"
      >
        {settings.logo_image_key ? (
          <img
            src={`/img/${settings.logo_image_key}`}
            alt=""
            className="h-[42rem] w-[42rem] object-contain opacity-[0.06]"
          />
        ) : (
          <HeartEyeMark variant="outline" className="h-[42rem] w-[42rem] opacity-40" />
        )}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-72px)] max-w-6xl flex-col justify-center px-5 py-20">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">
          {settings.hero_kicker}
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.04] text-ink md:text-7xl">
          {settings.hero_headline}
        </h1>
        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink/75 md:text-lg">
          {settings.hero_subline}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <PrimaryCta />
          <SecondaryCta />
        </div>
      </div>
    </section>
  );
}
