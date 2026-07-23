import type { Community, MemberCounts } from "@/lib/db";

// Instagram-style row of community circles — the first thing you see.
// Tap a circle to enter that community; the first circle creates a new one.
export function CommunityStories({
  communities,
  memberCounts = {},
}: {
  communities: Community[];
  memberCounts?: MemberCounts;
}) {
  return (
    <section id="communities" className="border-b border-black/5 bg-white/70">
      <div className="container-page">
        <div className="scrollbar-none flex gap-5 overflow-x-auto py-5">
          {/* Create — always first, like Instagram's "Your story +" */}
          <a href="/communities/new" className="group w-[4.5rem] shrink-0 text-center">
            <span className="mx-auto grid h-[4.2rem] w-[4.2rem] place-items-center rounded-full border-2 border-dashed border-ink/25 bg-white text-2xl text-ink/50 transition-colors group-hover:border-ink/50 group-hover:text-ink">
              ＋
            </span>
            <span className="mt-1.5 block truncate text-xs font-medium text-ink/70">
              New
            </span>
          </a>

          {communities.map((c) => {
            const count = memberCounts[c.id] ?? 0;
            return (
              <a
                key={c.id}
                href={`/c/${c.id}`}
                className="group w-[4.5rem] shrink-0 text-center"
              >
                {/* Gradient ring, story-style */}
                <span className="mx-auto block h-[4.2rem] w-[4.2rem] rounded-full bg-gradient-to-tr from-clay via-moss to-clay p-[2.5px] transition-transform group-hover:scale-105">
                  <span className="grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-cream bg-gradient-to-br from-clay/20 via-cream to-moss/20">
                    {c.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.cover}
                        alt={c.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-serif text-xl font-semibold text-ink/60">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-1.5 block truncate text-xs font-medium text-ink/80">
                  {c.name}
                </span>
                <span className="block truncate text-[11px] text-ink/40">
                  {count > 0 ? `${count} member${count === 1 ? "" : "s"}` : "new"}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
