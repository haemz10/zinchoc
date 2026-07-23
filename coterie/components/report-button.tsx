"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type TargetType = "post" | "listing" | "comment";

// A lightweight "report" control for non-owners. Files a row into
// coterie_reports for the operator to review. Hidden from the content's owner.
export function ReportButton({
  targetType,
  targetId,
  ownerId,
  className,
}: {
  targetType: TargetType;
  targetId: string;
  ownerId: string;
  className?: string;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabaseBrowser()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Don't let people report their own content, and require sign-in.
  if (!userId || userId === ownerId) return null;

  if (done) {
    return (
      <span className={`text-xs text-ink/40 ${className ?? ""}`}>
        Reported — thanks
      </span>
    );
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabaseBrowser()
      .from("coterie_reports")
      .insert({
        reporter_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason: reason.trim().slice(0, 300) || null,
      });
    setBusy(false);
    // 23505 = already reported by this user; treat as success.
    if (!error || error.code === "23505") {
      setDone(true);
      setOpen(false);
    }
  }

  if (open) {
    return (
      <div className={`mt-2 rounded-xl border border-ink/10 bg-cream p-2 ${className ?? ""}`}>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What's wrong? (optional)"
          maxLength={300}
          className="w-full rounded-lg border border-ink/15 bg-white px-2 py-1 text-xs outline-none focus:border-ink/40"
        />
        <div className="mt-1.5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-ink/50 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream disabled:opacity-50"
          >
            {busy ? "Sending…" : "Submit report"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`text-xs font-medium text-ink/40 hover:text-clay ${className ?? ""}`}
    >
      Report
    </button>
  );
}
