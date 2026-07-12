import type { Community, MemberCounts } from "@/lib/db";

export function Communities({
  communities,
  memberCounts = {},
}: {
  communities: Community[];
  memberCounts?: MemberCounts;
}) {
  return (
    <section
      id="communities"
      className="border-t border-black/5 bg-white/60 py-16"
    >
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Spaces worth your time
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">
              Click into a community to see what members are sharing — or start
              your own and build it from the ground up.
            </p>
          </div>
          <a
            href="/communities/new"
            className="hidden shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 sm:block"
          >
            Create a community
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communities.map((c) => {
            const count = memberCounts[c.id] ?? 0;
            return (
              <a
                key={c.id}
                href={`/c/${c.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[3/2] overflow-hidden bg-gradient-to-br from-clay/20 via-cream to-moss/20">
                  {c.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.cover}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-semibold">
                      {c.name}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-ink/50">
                      {count > 0
                        ? `${count} member${count === 1 ? "" : "s"}`
                        : "New"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">{c.blurb}</p>
                  <span className="mt-4 inline-block w-full rounded-full border border-ink/15 py-2 text-center text-sm font-semibold transition-colors group-hover:bg-ink group-hover:text-cream">
                    View community →
                  </span>
                </div>
              </a>
            );
          })}

          {/* Create-your-own card */}
          <a
            href="/communities/new"
            className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-white/40 p-6 text-center transition-colors hover:border-ink/40 hover:bg-white"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-clay/10 text-2xl">
              ＋
            </span>
            <span className="mt-3 font-serif text-lg font-semibold">
              Start your own
            </span>
            <span className="mt-1 text-sm text-ink/55">
              Create a community in a few seconds.
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
