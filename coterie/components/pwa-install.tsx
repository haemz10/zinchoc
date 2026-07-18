"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "coterie-install-dismissed";

// Registers the service worker and offers an "install as app" affordance:
//  - Android / desktop Chrome-family: a real install button (beforeinstallprompt)
//  - iOS Safari: a short "Add to Home Screen" instruction card
// Hidden once installed (standalone). "Not now" only hides it for the current
// browsing session (sessionStorage) so it re-appears on the next visit — a
// gentle reminder to install, until they actually do.
export function PwaInstall() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume hidden until we check

  useEffect(() => {
    // Register the service worker (progressive enhancement — no-op if unsupported).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          /* offline features simply won't be available */
        });
    }

    // Already installed / running as an app → never show the banner.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari exposes this non-standard flag when launched from home screen
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (standalone) return;

    // Dismissed for this session only — reappears next time they open the site.
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    setDismissed(false);

    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (isIos && isSafari) setShowIos(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => close();
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setDismissed(true);
    setDeferred(null);
    setShowIos(false);
    try {
      // Session-scoped: cleared when the browser/tab closes, so the prompt
      // returns on their next visit instead of being gone forever.
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — fine, just won't persist */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    close();
  }

  if (dismissed) return null;
  if (!deferred && !showIos) return null;

  return (
    // bottom-14 clears the mobile tab bar; md+ has no tab bar.
    <div className="fixed inset-x-0 bottom-14 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:px-0">
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-4 shadow-lg md:mx-0">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink font-serif text-xl leading-none text-cream">
            c
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-base font-semibold text-ink">
              Get the Coterie app
            </p>
            {showIos ? (
              <p className="mt-1 text-sm leading-relaxed text-ink/60">
                Tap the Share icon{" "}
                <span aria-hidden className="font-semibold">
                  ⎋
                </span>{" "}
                below, then{" "}
                <span className="font-semibold text-ink/80">
                  “Add to Home Screen”
                </span>{" "}
                to install Coterie.
              </p>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-ink/60">
                Install it to your home screen — full screen, faster, and one
                tap to open.
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {!showIos && (
                <button
                  type="button"
                  onClick={install}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
                >
                  Install app
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="rounded-full px-3 py-2 text-sm font-semibold text-ink/50 hover:text-ink"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:text-ink"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
