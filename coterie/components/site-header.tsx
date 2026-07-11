"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const nav = [
  { label: "Explore", href: "/#feed" },
  { label: "Marketplace", href: "/#marketplace" },
  { label: "Communities", href: "/#communities" },
];

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      const meta = data.user?.user_metadata as { username?: string } | undefined;
      setUsername(meta?.username ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
      const meta = session?.user?.user_metadata as { username?: string } | undefined;
      setUsername(meta?.username ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
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
          {email ? (
            <>
              <span className="hidden max-w-[14ch] truncate text-sm font-semibold text-ink/70 sm:block">
                @{username ?? email.split("@")[0]}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
              >
                Sign out
              </button>
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
