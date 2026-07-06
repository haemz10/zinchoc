import { useEffect, useRef, useState } from "react";

import { PrimaryCta } from "./PrimaryCta";
import type { Settings } from "../../lib/types";
import { SecondaryCta } from "./SecondaryCta";

// C3 scroll-driven mask reveal, used only when the owner has uploaded a hero
// image. Initial paint is the fully composed masked state (image visible, inset
// mask, headline over it). Scrolling through the first viewport expands the
// clip-path to full bleed. Animates clip-path only. prefers-reduced-motion and
// small screens get the static full-bleed hero. No pinning, so a full-page
// screenshot never shows a blank band.

export function HeroImageReveal({
  imageSrc,
  settings,
}: {
  imageSrc: string;
  settings: Settings;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inset, setInset] = useState(0); // 0 = full bleed; static-safe default

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (reduce || small) {
      setInset(0);
      return;
    }

    setInset(10); // start masked on capable devices
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = sectionRef.current;
        if (!el) return;
        const vh = window.innerHeight || 1;
        const progress = Math.min(1, Math.max(0, window.scrollY / (vh * 0.75)));
        setInset(10 * (1 - progress));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[88dvh] items-end overflow-hidden bg-ink"
      aria-label="Zin Choc"
    >
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}% round 2px)` }}
      >
        <img
          src={imageSrc}
          alt="A Zin Choc wedding tablescape of handcrafted chocolate bomboniere"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16">
        <p className="font-body text-xs uppercase tracking-[0.3em] text-beige/80">
          Wedding bomboniere, made in Australia
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-beige md:text-6xl">
          {settings.hero_headline}
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-beige/85">
          {settings.hero_subline}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <PrimaryCta />
          <SecondaryCta className="text-beige hover:text-gold" />
        </div>
      </div>
    </section>
  );
}
