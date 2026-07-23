"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { ensureProfile } from "@/lib/ensure-profile";
import { NotificationBell } from "./notification-bell";

const nav = [
  { label: "Explore", href: "/#feed" },
  { label: "Search", href: "/search" },
  { label: "Marketplace", href: "/#marketplace" },
  { label: "Communities", href: "/#communities" },
];

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = supabaseBrowser();
    const hydrate = async (user: { id: string; email?: string; user_metadata?: unknown } | null) => {
      setEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      const meta = user?.user_metadata as { username?: string } | undefined;
      setUsername(meta?.username ?? null);
      if (!user) {
        setIsAdmin(false);
        setAvatarUrl(null);
        return;
      }
      void ensureProfile(supabase, user as never);
      const { data: me } = await supabase
        .from("coterie_profiles")
        .select("is_admin,username,avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(Boolean(me?.is_admin));
      if (me?.username) setUsername(me.username);
      setAvatarUrl(me?.avatar_url ?? null);
    };
    supabase.auth.getUser().then(({ data }) => hydrate(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      hydrate(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.refresh();
  }

  const profileHref = username ? `/u/${username}` : "/settings";

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream font-serif text-lg leading-none">
            c
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">
            Coterie
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {email && userId ? (
            <>
              {isAdmin && (
                <a
                  href="/admin"
                  className="hidden text-sm font-medium text-clay transition-colors hover:text-ink lg:block"
                >
                  Admin
                </a>
              )}
              <a
                href="/messages"
                className="hidden text-sm font-medium text-ink/70 transition-colors hover:text-ink lg:block"
              >
                Messages
              </a>
              <a
                href="/communities/new"
                className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 sm:block"
              >
                Create community
              </a>

              <NotificationBell userId={userId} />

              {/* Avatar → own profile */}
              <a
                href={profileHref}
                aria-label="My profile"
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-ink/15 bg-white transition-colors hover:border-ink/40"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-sm font-semibold text-ink/60">
                    {(username ?? email).charAt(0).toUpperCase()}
                  </span>
                )}
              </a>

              {/* Settings gear */}
              <a
                href="/settings"
                aria-label="Settings"
                className="hidden h-10 w-10 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40 sm:grid"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.09a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
                </svg>
              </a>
            </>
          ) : (
            <>
              <a
                href="/auth"
                className="hidden text-sm font-medium text-ink/70 transition-colors hover:text-ink sm:block"
              >
                Sign in
              </a>
              <a
                href="/auth"
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Join Coterie
              </a>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-white text-ink md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M3 3l12 12" />
                  <path d="M15 3L3 15" />
                </>
              ) : (
                <>
                  <path d="M2 4.5h14" />
                  <path d="M2 9h14" />
                  <path d="M2 13.5h14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-black/5 bg-cream md:hidden"
        >
          <div className="container-page flex flex-col py-2">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-black/5 py-3 text-sm font-medium text-ink/80 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            {email ? (
              <>
                <a
                  href={profileHref}
                  onClick={() => setOpen(false)}
                  className="border-b border-black/5 py-3 text-sm font-medium text-ink/80 hover:text-ink"
                >
                  My profile
                </a>
                <a
                  href="/messages"
                  onClick={() => setOpen(false)}
                  className="border-b border-black/5 py-3 text-sm font-medium text-ink/80 hover:text-ink"
                >
                  Messages
                </a>
                <a
                  href="/saved"
                  onClick={() => setOpen(false)}
                  className="border-b border-black/5 py-3 text-sm font-medium text-ink/80 hover:text-ink"
                >
                  Saved
                </a>
                <a
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="border-b border-black/5 py-3 text-sm font-medium text-ink/80 hover:text-ink"
                >
                  Settings
                </a>
                {isAdmin && (
                  <a
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="border-b border-black/5 py-3 text-sm font-medium text-clay hover:text-ink"
                  >
                    Admin
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="py-3 text-left text-sm font-medium text-ink/80 hover:text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <a
                href="/auth"
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-ink/80 hover:text-ink"
              >
                Sign in / Join
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
