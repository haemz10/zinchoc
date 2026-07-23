"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type State = "checking" | "ready" | "invalid" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    // The recovery link establishes a temporary session via the URL. Listen
    // for it, and also check directly in case it's already been processed.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setState("ready");
    });
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setState((s) => (s === "checking" ? (data.session ? "ready" : "invalid") : s));
    }, 2500);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setState("done");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          {state === "checking" && (
            <p className="text-center text-ink/50">Verifying your link…</p>
          )}

          {state === "invalid" && (
            <div className="text-center">
              <h1 className="font-serif text-2xl font-semibold tracking-tight">
                Link expired or invalid
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                Password reset links can only be used once and expire after a
                while. Request a fresh one.
              </p>
              <a
                href="/auth"
                className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Back to sign in
              </a>
            </div>
          )}

          {state === "done" && (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss/10 text-2xl">
                ✅
              </div>
              <h1 className="mt-5 font-serif text-2xl font-semibold tracking-tight">
                Password updated
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                You&apos;re signed in — taking you home…
              </p>
            </div>
          )}

          {state === "ready" && (
            <>
              <h1 className="font-serif text-3xl font-semibold tracking-tight">
                Set a new password
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                Choose a new password for your account.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-3">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50"
                  >
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
                  />
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
                  {busy ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
