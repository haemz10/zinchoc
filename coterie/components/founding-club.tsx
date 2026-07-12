"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Status = "idle" | "sending" | "done" | "error";

const steps = [
  {
    n: "01",
    title: "Claim your spot",
    body: "Create your account (or drop your email). That reserves your founding place and your @username before the public launch.",
  },
  {
    n: "02",
    title: "Shape it with us",
    body: "Start or join communities, post the first threads, and tell us what to build next. Founding members set the tone this place grows into.",
  },
  {
    n: "03",
    title: "Keep the badge",
    body: "When Coterie opens to everyone, you keep a permanent Founding Member badge — and the communities you started are yours to lead.",
  },
];

const perks = [
  "Permanent Founding Member badge on your profile",
  "First to create communities and claim their names",
  "A direct line to the team to shape the roadmap",
  "Free for founding members, always",
];

export function FoundingClub() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session?.user))
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  return (
    <section id="founding" className="border-t border-black/5 py-16">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-clay">
            The Founding Club
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Help build Coterie from day one
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">
            Coterie is just getting started, and the first members shape what it
            becomes. Join the Founding Club to start communities, post the first
            threads, and earn a permanent place in the story.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <span className="font-serif text-2xl font-semibold text-clay">
                {s.n}
              </span>
              <h3 className="mt-2 font-serif text-lg font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Perks + call to action */}
        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-clay/20 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-serif text-xl font-semibold">
                What founding members get
              </h3>
              <ul className="mt-4 space-y-2.5">
                {perks.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm text-ink/70">
                    <span className="mt-0.5 text-moss" aria-hidden>
                      ✓
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-center">
              {signedIn ? (
                <div className="text-center sm:text-left">
                  <p className="rounded-2xl bg-moss/10 px-5 py-4 text-sm font-semibold text-moss">
                    You&apos;re in — welcome, founding member. 🎉
                  </p>
                  <a
                    href="/communities/new"
                    className="mt-4 inline-block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
                  >
                    Start your first community
                  </a>
                  <a
                    href="/#communities"
                    className="mt-2 inline-block w-full rounded-full border border-ink/15 px-6 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-ink/40"
                  >
                    Browse communities to join
                  </a>
                </div>
              ) : status === "done" ? (
                <div className="text-center sm:text-left">
                  <p className="rounded-2xl bg-moss/10 px-5 py-4 text-sm font-semibold text-moss">
                    You&apos;re on the founding list! We&apos;ll be in touch. 🎉
                  </p>
                  <a
                    href="/auth"
                    className="mt-4 inline-block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
                  >
                    Create your account now
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Reserve your founding spot
                  </p>
                  <p className="mt-1 text-sm text-ink/55">
                    Create an account to start right away, or leave your email.
                  </p>
                  <a
                    href="/auth"
                    className="mt-4 inline-block w-full rounded-full bg-ink px-6 py-3 text-center text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
                  >
                    Join Coterie now
                  </a>
                  <div className="my-3 flex items-center gap-3 text-xs text-ink/40">
                    <span className="h-px flex-1 bg-ink/10" /> or{" "}
                    <span className="h-px flex-1 bg-ink/10" />
                  </div>
                  <form onSubmit={submit} className="flex flex-col gap-2">
                    <label htmlFor="founding-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="founding-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-full border border-ink/15 bg-cream px-5 py-3 text-sm outline-none transition-colors focus:border-ink/40"
                    />
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-60"
                    >
                      {status === "sending" ? "Joining…" : "Email me an invite"}
                    </button>
                  </form>
                  {status === "error" && (
                    <p role="alert" className="mt-2 text-sm font-medium text-clay">
                      {message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
