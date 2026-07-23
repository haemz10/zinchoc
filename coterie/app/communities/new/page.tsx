"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function NewCommunityPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugify(name), [name]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setReady(true);
    });
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !userId) return;
    setError(null);

    if (slug.length < 3) {
      setError("Please use a name with at least 3 letters or numbers.");
      return;
    }
    if (blurb.trim().length < 4) {
      setError("Add a short description (at least a few words).");
      return;
    }

    setBusy(true);
    const supabase = supabaseBrowser();

    const { error: insertErr } = await supabase
      .from("coterie_communities")
      .insert({
        id: slug,
        name: name.trim().slice(0, 40),
        blurb: blurb.trim().slice(0, 140),
        created_by: userId,
      });

    if (insertErr) {
      setBusy(false);
      setError(
        insertErr.code === "23505"
          ? "That name is taken — try a slightly different one."
          : "Could not create the community. Please try again."
      );
      return;
    }

    // Creator automatically joins their own community.
    await supabase
      .from("coterie_memberships")
      .insert({ user_id: userId, community_id: slug });

    router.push(`/c/${slug}`);
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-widest text-clay">
            Start something
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Create a community
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Name it, describe it, and it&apos;s yours. You&apos;ll be the first
            member — invite your people and build it up from there.
          </p>

          {ready && !userId ? (
            <div className="mt-6 rounded-2xl border border-clay/20 bg-cream p-5 text-center">
              <p className="text-sm text-ink/70">
                You need an account to create a community.
              </p>
              <a
                href="/auth"
                className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Join Coterie
              </a>
            </div>
          ) : (
            <form onSubmit={create} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50"
                >
                  Community name
                </label>
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Urban Beekeepers"
                  maxLength={40}
                  className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
                />
                {slug && (
                  <p className="mt-1 text-xs text-ink/45">
                    Your community link: coterie.app/c/
                    <span className="font-semibold text-ink/70">{slug}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="blurb"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50"
                >
                  What&apos;s it about?
                </label>
                <textarea
                  id="blurb"
                  required
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="A one-line description members will see."
                  rows={2}
                  maxLength={140}
                  className="w-full resize-none rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
                />
                <p className="mt-1 text-xs text-ink/45">
                  {140 - blurb.length} characters left
                </p>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-clay">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create community"}
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
