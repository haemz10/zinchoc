"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Party = { username: string; display_name: string };
type Thread = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing: { id: string; title: string } | null;
  buyer: Party | null;
  seller: Party | null;
};
type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function MessagesInner() {
  const search = useSearchParams();
  const preselect = search.get("t");
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(preselect);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load session + threads.
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      setReady(true);
      if (!uid) return;
      const { data: rows } = await supabase
        .from("coterie_threads")
        .select(
          "id,buyer_id,seller_id," +
            "listing:coterie_listings(id,title)," +
            "buyer:coterie_profiles!coterie_threads_buyer_id_fkey(username,display_name)," +
            "seller:coterie_profiles!coterie_threads_seller_id_fkey(username,display_name)"
        )
        .order("created_at", { ascending: false });
      const list = ((rows as unknown[]) ?? []).map((r) => {
        const t = r as Thread & {
          listing: unknown;
          buyer: unknown;
          seller: unknown;
        };
        return {
          ...t,
          listing: one(t.listing) as Thread["listing"],
          buyer: one(t.buyer) as Party | null,
          seller: one(t.seller) as Party | null,
        };
      });
      setThreads(list);
      if (!preselect && list.length > 0) setActiveId(list[0].id);
    });
  }, [preselect]);

  // Load messages, subscribe to realtime, and poll as a fallback (in case
  // websockets are blocked on the network) for the active thread.
  useEffect(() => {
    if (!activeId) return;
    const supabase = supabaseBrowser();
    let channel: RealtimeChannel | undefined;
    let cancelled = false;

    const merge = (incoming: Message[]) =>
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const added = incoming.filter((m) => !seen.has(m.id));
        // Drop any optimistic temps that now have a real match by body+sender.
        return added.length ? [...prev, ...added] : prev;
      });

    const fetchAll = async () => {
      const { data } = await supabase
        .from("coterie_messages")
        .select("id,thread_id,sender_id,body,created_at")
        .eq("thread_id", activeId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) {
        setMessages((prev) => {
          const temps = prev.filter((m) => m.id.startsWith("tmp-"));
          const server = data as Message[];
          const serverBodies = new Set(
            server.map((m) => `${m.sender_id}:${m.body}`)
          );
          const keptTemps = temps.filter(
            (t) => !serverBodies.has(`${t.sender_id}:${t.body}`)
          );
          return [...server, ...keptTemps];
        });
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 4000);

    channel = supabase
      .channel(`thread-${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "coterie_messages",
          filter: `thread_id=eq.${activeId}`,
        },
        (payload) => merge([payload.new as Message])
      )
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || !activeId || !userId || busy) return;
    setBusy(true);
    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      thread_id: activeId,
      sender_id: userId,
      body: text,
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, optimistic]);
    setBody("");
    const { data, error } = await supabaseBrowser()
      .from("coterie_messages")
      .insert({ thread_id: activeId, sender_id: userId, body: text })
      .select("id,thread_id,sender_id,body,created_at")
      .single();
    setBusy(false);
    if (!error && data) {
      setMessages((p) =>
        p.map((m) => (m.id === optimistic.id ? (data as Message) : m))
      );
    }
  }

  const active = threads.find((t) => t.id === activeId) ?? null;
  const other = active
    ? userId === active.seller_id
      ? active.buyer
      : active.seller
    : null;

  if (ready && !userId) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-serif text-3xl font-semibold">Your messages</h1>
        <p className="mt-2 text-ink/60">Sign in to see your conversations.</p>
        <a
          href="/auth"
          className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 font-serif text-3xl font-semibold tracking-tight">
        Messages
      </h1>

      {threads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <p className="text-ink/60">
            No conversations yet. Open a listing in the marketplace and message
            the seller to start one.
          </p>
          <a
            href="/#marketplace"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream"
          >
            Browse marketplace
          </a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[300px_1fr]">
          {/* Thread list */}
          <aside className="space-y-2">
            {threads.map((t) => {
              const o =
                userId === t.seller_id ? t.buyer : t.seller;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    t.id === activeId
                      ? "border-ink/30 bg-white"
                      : "border-black/5 bg-white/60 hover:bg-white"
                  }`}
                >
                  <p className="truncate text-sm font-semibold">
                    @{o?.username ?? "member"}
                  </p>
                  <p className="truncate text-xs text-ink/50">
                    {t.listing?.title ?? "Listing removed"}
                  </p>
                </button>
              );
            })}
          </aside>

          {/* Conversation */}
          <section className="flex h-[60vh] flex-col rounded-3xl border border-black/5 bg-white">
            {active && (
              <div className="border-b border-black/5 px-5 py-3">
                <p className="text-sm font-semibold">
                  @{other?.username ?? "member"}
                </p>
                {active.listing && (
                  <a
                    href={`/marketplace/${active.listing.id}`}
                    className="text-xs text-clay hover:underline"
                  >
                    {active.listing.title}
                  </a>
                )}
              </div>
            )}

            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-ink/40">
                  Say hello — ask about the item, price, or delivery.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === userId;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <span
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          mine
                            ? "bg-ink text-cream"
                            : "bg-cream text-ink"
                        }`}
                      >
                        {m.body}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={send}
              className="flex items-center gap-2 border-t border-black/5 p-3"
            >
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message…"
                maxLength={2000}
                className="w-full flex-1 rounded-full border border-ink/15 bg-cream px-4 py-2.5 text-sm outline-none focus:border-ink/40"
              />
              <button
                type="submit"
                disabled={busy || !body.trim()}
                className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">
        <Suspense
          fallback={
            <div className="container-page py-16 text-ink/50">Loading…</div>
          }
        >
          <MessagesInner />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
