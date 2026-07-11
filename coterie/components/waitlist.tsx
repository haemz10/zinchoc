"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

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
    <section id="waitlist" className="border-t border-black/5 py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl rounded-3xl border border-clay/20 bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-clay">
            Early access
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Be first through the door
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink/60">
            Coterie is opening to a small group of founding members. Leave
            your email and we&apos;ll send your invite — no spam, ever.
          </p>

          {status === "done" ? (
            <p
              role="status"
              className="mx-auto mt-8 max-w-md rounded-2xl bg-moss/10 px-6 py-4 font-semibold text-moss"
            >
              You&apos;re on the list! We&apos;ll be in touch soon. 🎉
            </p>
          ) : (
            <form
              onSubmit={submit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              {/* Honeypot field — hidden from real users */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full flex-1 rounded-full border border-ink/15 bg-cream px-5 py-3 text-sm outline-none transition-colors focus:border-ink/40"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {status === "sending" ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p role="alert" className="mt-3 text-sm font-medium text-clay">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
