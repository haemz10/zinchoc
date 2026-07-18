"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Notice = {
  id: string;
  type: "comment" | "community_post" | "join" | "message";
  target_type: string;
  target_id: string;
  preview: string | null;
  read: boolean;
  created_at: string;
  actor: { username: string; display_name: string } | null;
};

function describe(n: Notice): string {
  const who = n.actor?.display_name ?? "Someone";
  switch (n.type) {
    case "comment":
      return `${who} commented on your post`;
    case "community_post":
      return `${who} posted in your community`;
    case "join":
      return `${who} joined ${n.preview || "your community"}`;
    case "message":
      return `${who} sent you a message`;
  }
}

function linkFor(n: Notice): string {
  switch (n.target_type) {
    case "community":
      return `/c/${n.target_id}`;
    case "thread":
      return `/messages?thread=${n.target_id}`;
    case "listing":
      return `/marketplace/${n.target_id}`;
    default:
      return "/#feed";
  }
}

// Bell with unread badge; realtime inserts update it live, and (when the
// member enabled banner alerts in Settings) fire a system notification.
export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const bannerOn = useRef(false);

  const load = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("coterie_notifications")
      .select(
        "id,type,target_type,target_id,preview,read,created_at,actor:coterie_profiles!coterie_notifications_actor_id_fkey(username,display_name)"
      )
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = ((data as unknown[]) ?? []).map((r) => {
      const t = r as Notice & { actor: unknown };
      const actor = Array.isArray(t.actor) ? t.actor[0] : t.actor;
      return { ...t, actor: (actor ?? null) as Notice["actor"] };
    });
    setItems(rows);
    setUnread(rows.filter((r) => !r.read).length);
  }, []);

  useEffect(() => {
    const supabase = supabaseBrowser();
    void load();

    supabase
      .from("coterie_notification_prefs")
      .select("banner_enabled")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        bannerOn.current = Boolean(data?.banner_enabled);
      });

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "coterie_notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void load();
          if (
            bannerOn.current &&
            typeof Notification !== "undefined" &&
            window.Notification.permission === "granted"
          ) {
            try {
              new window.Notification("Coterie", {
                body: "You have a new notification",
                icon: "/icon-192.png",
              });
            } catch {
              /* some browsers block constructor — fine */
            }
          }
        }
      )
      .subscribe();

    // Polling fallback (realtime can drop on flaky connections)
    const t = setInterval(() => void load(), 30000);
    return () => {
      void supabase.removeChannel(channel);
      clearInterval(t);
    };
  }, [userId, load]);

  async function openBell() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setItems((xs) => xs.map((x) => ({ ...x, read: true })));
      await supabaseBrowser()
        .from("coterie_notifications")
        .update({ read: true })
        .eq("read", false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openBell}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z" />
          <path d="M10 20a2.2 2.2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-12 z-50 w-[19rem] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
            <p className="border-b border-black/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink/40">
              Notifications
            </p>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink/45">
                  Nothing yet — it&apos;s quiet in here.
                </p>
              ) : (
                items.map((n) => (
                  <a
                    key={n.id}
                    href={linkFor(n)}
                    className={`block border-b border-black/5 px-4 py-3 text-sm last:border-0 hover:bg-cream ${
                      n.read ? "text-ink/60" : "font-medium text-ink"
                    }`}
                  >
                    {describe(n)}
                    {n.type !== "join" && n.preview && (
                      <span className="mt-0.5 block truncate text-xs font-normal text-ink/45">
                        “{n.preview}”
                      </span>
                    )}
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
