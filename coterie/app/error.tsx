"use client";

// Graceful client error boundary so an unexpected failure shows a friendly
// screen with a retry instead of a blank page.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-serif text-5xl font-semibold text-clay">
        Something broke
      </span>
      <p className="mt-4 max-w-sm text-ink/60">
        An unexpected error occurred. Please try again — if it keeps happening,
        let us know.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
        >
          Go home
        </a>
      </div>
    </main>
  );
}
