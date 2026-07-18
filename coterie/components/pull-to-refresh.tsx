"use client";

import { useEffect, useState } from "react";

// Standalone PWAs (and overscroll-behavior: contain) lose the browser's
// native pull-to-refresh — this restores it: pull down from the very top of
// the page past the threshold and the app reloads.
export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0;
    let pulling = false;
    let dist = 0;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
        dist = 0;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (!pulling) return;
      dist = e.touches[0].clientY - startY;
      if (dist > 0 && window.scrollY <= 0) {
        setPull(Math.min(dist, 120));
      } else {
        dist = 0;
        setPull(0);
      }
    };
    const onEnd = () => {
      if (pulling && dist > 80) {
        setRefreshing(true);
        setPull(90);
        window.location.reload();
      } else {
        setPull(0);
      }
      pulling = false;
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  if (pull <= 10 && !refreshing) return null;

  const ready = refreshing || pull > 80;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-2 z-[60] flex justify-center md:hidden"
      style={{
        transform: `translateY(${Math.min(pull, 96) * 0.5}px)`,
        opacity: refreshing ? 1 : Math.min(pull / 80, 1),
      }}
      aria-hidden
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-full bg-ink text-lg text-cream shadow-lg ${
          ready ? "animate-spin" : ""
        }`}
        style={
          ready ? undefined : { transform: `rotate(${pull * 3}deg)` }
        }
      >
        ↻
      </span>
    </div>
  );
}
