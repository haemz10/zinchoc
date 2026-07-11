import { feed } from "@/lib/data";

// A few images pulled straight into the hero so visitors immediately see
// that Coterie is full of photos and posts from real members.
const collage = feed.slice(0, 5);

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="container-page grid items-center gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
        {/* Left: what this place is */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink/60">
            Ad-free · Member-owned
          </span>

          <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            A quiet home for the
            <br />
            communities you actually love.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
            Coterie is where niche communities gather to share photos and
            stories, help each other out, and trade what they make. Find your
            people — or build a space that&apos;s entirely your own. No ads. No
            algorithm. Just members.
          </p>

          {/* The marketplace line, promoted from the footer to the very top */}
          <a
            href="#marketplace"
            className="mt-6 flex max-w-md items-center gap-3 rounded-2xl border border-clay/20 bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-clay/10 text-lg">
              🛍️
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-clay">
                Trending in the marketplace
              </span>
              <span className="block text-sm text-ink/60">
                Small-batch goods from members across every community.
              </span>
            </span>
          </a>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#feed"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Explore communities
            </a>
            <a
              href="#communities"
              className="rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
            >
              Start your own
            </a>
          </div>

          <dl className="mt-10 flex gap-8">
            {[
              ["4", "founding communities"],
              ["Ad-free", "always"],
              ["Member", "owned"],
            ].map(([big, small]) => (
              <div key={small}>
                <dt className="font-serif text-2xl font-semibold">{big}</dt>
                <dd className="text-sm text-ink/55">{small}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: a lively collage so the page feels full of photos from the start */}
        <div className="animate-fade-up [animation-delay:120ms]">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-3">
              {collage.slice(0, 2).map((p, i) => (
                <HeroTile key={p.id} src={p.image} tall={i === 0} />
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              {collage.slice(2, 5).map((p, i) => (
                <HeroTile key={p.id} src={p.image} tall={i === 1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroTile({ src, tall }: { src: string; tall?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-black/5 shadow-sm ${
        tall ? "aspect-[3/4]" : "aspect-square"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="A photo shared by a Coterie member"
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        loading="eager"
      />
    </div>
  );
}
