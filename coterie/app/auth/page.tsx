"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Set once the confirmation email has been sent — shows the check-inbox view.
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  // Password-reset flow.
  const [resetting, setResetting] = useState(false);
  const [resetSentTo, setResetSentTo] = useState<string | null>(null);
  // Founding Club — only the first 10 members can join.
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    supabaseBrowser()
      .rpc("coterie_founding_spots_left")
      .then(({ data }) => setSpotsLeft(typeof data === "number" ? data : null));
  }, []);

  const foundingFull = spotsLeft === 0;

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/reset` }
    );
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResetSentTo(email.trim());
  }

  async function resend() {
    if (!sentTo || busy) return;
    setBusy(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    setResent(!error);
    if (error) setError(error.message);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = supabaseBrowser();

    try {
      if (mode === "signup") {
        if (foundingFull) {
          setError(
            "Coterie is in founding mode and all 10 founding spots are taken. Ask a founding member to invite you when spots open."
          );
          return;
        }
        const cleanUsername = username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
          setError(
            "Username must be 3–24 characters: lowercase letters, numbers, underscores."
          );
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            // Return to whatever domain the user signed up on.
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: cleanUsername,
              display_name: displayName.trim() || cleanUsername,
            },
          },
        });
        if (error) {
          const m = error.message.toLowerCase();
          setError(
            m.includes("founding") || m.includes("database error")
              ? "Coterie is in founding mode and all 10 founding spots are taken."
              : error.message
          );
          return;
        }
        if (!data.session) {
          // Email confirmation is on — tell them to check their inbox.
          setSentTo(email.trim());
          return;
        }
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setError(
            error.message.toLowerCase().includes("not confirmed")
              ? "Please confirm your email first — check your inbox for the link."
              : error.message
          );
          return;
        }
        router.push("/");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  // Password reset — link sent confirmation.
  if (resetSentTo) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss/10 text-2xl">
              🔑
            </div>
            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight">
              Reset link sent
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              If an account exists for{" "}
              <span className="font-semibold text-ink">{resetSentTo}</span>,
              we&apos;ve emailed a link to set a new password. Check your inbox
              (and spam).
            </p>
            <button
              type="button"
              onClick={() => {
                setResetSentTo(null);
                setResetting(false);
                setMode("signin");
              }}
              className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              Back to sign in
            </button>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Password reset — request form.
  if (resetting) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              Enter the email you signed up with — your login ID is your email
              address — and we&apos;ll send a reset link.
            </p>
            <form onSubmit={requestReset} className="mt-6 space-y-3">
              <Field
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
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
                {busy ? "Sending…" : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetting(false);
                  setError(null);
                }}
                className="w-full rounded-full py-2 text-sm font-semibold text-ink/60 hover:text-ink"
              >
                Back to sign in
              </button>
            </form>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (sentTo) {
    return (
      <>
        <SiteHeader />
        <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss/10 text-2xl">
              ✉️
            </div>
            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              We sent a confirmation link to{" "}
              <span className="font-semibold text-ink">{sentTo}</span>. Click it
              to activate your account, then come back and sign in.
            </p>
            <p className="mt-2 text-xs text-ink/50">
              Can&apos;t find it? Check spam, or resend below.
            </p>

            {resent ? (
              <p className="mt-6 rounded-2xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                Sent again — give it a minute.
              </p>
            ) : (
              <button
                type="button"
                onClick={resend}
                disabled={busy}
                className="mt-6 w-full rounded-full border border-ink/15 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-60"
              >
                {busy ? "Resending…" : "Resend confirmation link"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSentTo(null);
                setResent(false);
                setMode("signin");
              }}
              className="mt-3 w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
            >
              I&apos;ve confirmed — sign in
            </button>

            {error && (
              <p role="alert" className="mt-3 text-sm font-medium text-clay">
                {error}
              </p>
            )}
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {mode === "signup" ? "Join Coterie" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            {mode === "signup"
              ? "Create your member account — free, forever."
              : "Sign in to post and join communities."}
          </p>

          {mode === "signup" && spotsLeft !== null && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                foundingFull
                  ? "bg-clay/10 text-clay"
                  : "bg-moss/10 text-moss"
              }`}
            >
              {foundingFull
                ? "🔒 Founding Club is full — all 10 founding spots are taken. Existing members can still sign in."
                : `✨ Founding Club — only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left.`}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 rounded-full border border-ink/10 p-1 text-sm font-semibold">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-full py-2 transition-colors ${
                  mode === m ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"
                }`}
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <>
                <Field
                  id="username"
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  placeholder="e.g. maraclay"
                  autoComplete="username"
                />
                <Field
                  id="displayName"
                  label="Display name"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder="e.g. Mara Ellison"
                  autoComplete="name"
                />
              </>
            )}
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 6 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />

            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink/45">Your login ID is your email.</span>
                <button
                  type="button"
                  onClick={() => {
                    setResetting(true);
                    setError(null);
                    setNotice(null);
                  }}
                  className="font-semibold text-ink/60 hover:text-ink"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-clay">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="rounded-xl bg-moss/10 px-4 py-3 text-sm font-medium text-moss">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || (mode === "signup" && foundingFull)}
              className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy
                ? "One moment…"
                : mode === "signup"
                  ? foundingFull
                    ? "Founding Club full"
                    : "Create account"
                  : "Sign in"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={type === "password" ? 6 : undefined}
        className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
      />
    </div>
  );
}
