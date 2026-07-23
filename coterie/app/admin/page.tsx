"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Report = {
  id: string;
  target_type: "post" | "listing" | "comment";
  target_id: string;
  reason: string | null;
  created_at: string;
  reporter: { username: string } | null;
  content?: string;
  contentMissing?: boolean;
};

type State = "checking" | "denied" | "ready";

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default function AdminPage() {
  const [state, setState] = useState<State>("checking");
  const [reports, setReports] = useState<Report[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("coterie_reports")
      .select(
        "id,target_type,target_id,reason,created_at,reporter:coterie_profiles!coterie_reports_reporter_id_fkey(username)"
      )
      .order("created_at", { ascending: false });

    const rows = ((data as unknown[]) ?? []).map((r) => {
      const t = r as Report & { reporter: unknown };
      return { ...t, reporter: one(t.reporter) as { username: string } | null };
    });

    // Fetch each reported item's current content.
    const withContent = await Promise.all(
      rows.map(async (r) => {
        const table =
          r.target_type === "post"
            ? "coterie_posts"
            : r.target_type === "listing"
              ? "coterie_listings"
              : "coterie_comments";
        const col =
          r.target_type === "post"
            ? "caption"
            : r.target_type === "listing"
              ? "title"
              : "body";
        const { data: c } = await supabase
          .from(table)
          .select(col)
          .eq("id", r.target_id)
          .maybeSingle();
        return {
          ...r,
          content: c ? (c as Record<string, string>)[col] : undefined,
          contentMissing: !c,
        };
      })
    );
    setReports(withContent);
  }

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setState("denied");
        return;
      }
      const { data: me } = await supabase
        .from("coterie_profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();
      if (!me?.is_admin) {
        setState("denied");
        return;
      }
      setState("ready");
      await load();
    });
  }, []);

  async function deleteContent(r: Report) {
    if (busyId) return;
    setBusyId(r.id);
    const supabase = supabaseBrowser();
    const table =
      r.target_type === "post"
        ? "coterie_posts"
        : r.target_type === "listing"
          ? "coterie_listings"
          : "coterie_comments";
    await supabase.from(table).delete().eq("id", r.target_id);
    await supabase.from("coterie_reports").delete().eq("id", r.id);
    setReports((rs) => rs.filter((x) => x.id !== r.id));
    setBusyId(null);
  }

  async function dismiss(r: Report) {
    if (busyId) return;
    setBusyId(r.id);
    await supabaseBrowser().from("coterie_reports").delete().eq("id", r.id);
    setReports((rs) => rs.filter((x) => x.id !== r.id));
    setBusyId(null);
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        {state === "checking" && <p className="text-ink/50">Loading…</p>}

        {state === "denied" && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <h1 className="font-serif text-3xl font-semibold">Admins only</h1>
            <p className="mt-2 text-ink/60">
              You don&apos;t have access to the moderation dashboard.
            </p>
            <a
              href="/"
              className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
            >
              Back to home
            </a>
          </div>
        )}

        {state === "ready" && (
          <>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-clay">
                  Moderation
                </span>
                <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
                  Reported content
                </h1>
                <p className="mt-1 text-ink/60">
                  {reports.length === 0
                    ? "Nothing to review — the queue is clear."
                    : `${reports.length} open report${reports.length === 1 ? "" : "s"}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={load}
                className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40"
              >
                Refresh
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-clay/10 px-2.5 py-1 font-semibold uppercase tracking-wide text-clay">
                      {r.target_type}
                    </span>
                    <span className="text-ink/50">
                      reported by @{r.reporter?.username ?? "member"}
                    </span>
                    {r.reason && (
                      <span className="text-ink/60">· “{r.reason}”</span>
                    )}
                  </div>

                  <div className="mt-3 rounded-xl bg-cream p-3 text-sm text-ink/80">
                    {r.contentMissing ? (
                      <span className="italic text-ink/40">
                        Content already removed.
                      </span>
                    ) : (
                      r.content || <span className="text-ink/40">(no text)</span>
                    )}
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => dismiss(r)}
                      disabled={busyId === r.id}
                      className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink hover:border-ink/40 disabled:opacity-60"
                    >
                      Dismiss
                    </button>
                    {!r.contentMissing && (
                      <button
                        type="button"
                        onClick={() => deleteContent(r)}
                        disabled={busyId === r.id}
                        className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        {busyId === r.id ? "Removing…" : "Delete content"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
