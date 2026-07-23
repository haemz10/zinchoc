"use client";

import { useState } from "react";

// App-style bottom tab bar, mobile only — Home · Market · ＋ · Messages.
// The center ＋ opens a small create menu (post / community / listing),
// mirroring how Instagram's compose button works.
export function BottomNav() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      {createOpen && (
        <button
          type="button"
          aria-label="Close create menu"
          onClick={() => setCreateOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
        />
      )}

      {createOpen && (
        <div className="fixed inset-x-4 bottom-[5.5rem] z-50 rounded-2xl border border-black/10 bg-white p-2 shadow-xl md:hidden">
          {[
            { emoji: "✍️", label: "New post", href: "/#composer" },
            { emoji: "👥", label: "New community", href: "/communities/new" },
            { emoji: "🛍️", label: "Sell an item", href: "/marketplace/new" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setCreateOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-cream"
            >
              <span className="text-lg" aria-hidden>
                {item.emoji}
              </span>
              {item.label}
            </a>
          ))}
        </div>
      )}

      <nav
        aria-label="App"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          <a href="/" className="grid place-items-center text-ink" aria-label="Home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
          </a>
          <a href="/search" className="grid place-items-center text-ink" aria-label="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.8-3.8" />
            </svg>
          </a>
          <a href="/#marketplace" className="grid place-items-center text-ink" aria-label="Marketplace">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 8h14l-1 13H6L5 8Z" />
              <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            aria-label="Create"
            aria-expanded={createOpen}
            className="grid place-items-center"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-xl leading-none text-cream">
              ＋
            </span>
          </button>
          <a href="/messages" className="grid place-items-center text-ink" aria-label="Messages">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z" />
            </svg>
          </a>
        </div>
      </nav>
    </>
  );
}
