import { communities } from "@/lib/data";
import type { MemberCounts } from "@/lib/db";
import { JoinButton } from "./join-button";

// Maps homepage display cards to database community ids.
const dbIds: Record<string, string> = {
  c1: "slow-ceramics",
  c2: "sourdough-club",
  c3: "35mm-wanderers",
  c4: "rare-aroids",
};

export function Communities({
  memberCounts = {},
}: {
  memberCounts?: MemberCounts;
}) {
  return (
    <section id="communities" className="border-t border-black/5 bg-white/60 py-16">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Spaces worth your time
            </h2>
            <p className="mt-2 max-w-xl text-ink/60">
              Featured communities that are active, welcoming, and delightfully
              specific.
            </p>
          </div>
          <a
            href="#communities"
            className="hidden shrink-0 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold transition-colors hover:border-ink/40 sm:block"
          >
            See all communities
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {communities.map((c) => (
            <article
              key={c.id}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="aspect-[3/2] overflow-hidden bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.cover}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold">{c.name}</h3>
                  <span className="shrink-0 text-xs font-medium text-ink/50">
                    {(memberCounts[dbIds[c.id]] ?? 0) > 0
                      ? `${memberCounts[dbIds[c.id]]} member${memberCounts[dbIds[c.id]] === 1 ? "" : "s"}`
                      : "Be the first to join"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/60">{c.blurb}</p>
                <JoinButton communityId={dbIds[c.id]} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
