import { useCallback, useEffect, useState } from "react";

import {
  adminDeleteFaqItem,
  adminListFaq,
  adminMoveFaqItem,
  adminSaveFaqItem,
  adminSetFaqVisible,
} from "../../lib/api/admin.functions";
import type { FaqItem } from "../../lib/types";

// Admin FAQ tab: add, edit, delete, reorder and hide questions. The public
// FAQ page and home excerpt render from this list.

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";
const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";

type Draft = { id?: number; question: string; answer: string };

export function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await adminListFaq();
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function save() {
    if (!draft) return;
    if (!draft.question.trim() || !draft.answer.trim()) {
      setError("Both a question and an answer are needed.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminSaveFaqItem({
        data: { id: draft.id, question: draft.question.trim(), answer: draft.answer.trim() },
      });
      setDraft(null);
      await refresh();
    } catch {
      setError("Could not save the question. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: FaqItem) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete "${item.question}"? This cannot be undone.`)
    ) {
      return;
    }
    await adminDeleteFaqItem({ data: { id: item.id } });
    await refresh();
  }

  async function toggleVisible(item: FaqItem) {
    await adminSetFaqVisible({ data: { id: item.id, visible: item.visible !== 1 } });
    await refresh();
  }

  async function move(item: FaqItem, dir: "up" | "down") {
    await adminMoveFaqItem({ data: { id: item.id, dir } });
    await refresh();
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading questions...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">FAQ</h2>
        <button
          type="button"
          onClick={() => {
            setError("");
            setDraft({ question: "", answer: "" });
          }}
          className={`${btn} bg-ink text-beige`}
        >
          Add question
        </button>
      </div>
      <p className="mt-2 font-body text-xs text-ink/55">
        The first four visible questions also appear on the home page. You can write{" "}
        {"{{contact_email}}"} and {"{{abn}}"} in answers; they are replaced with your current
        settings.
      </p>

      {draft ? (
        <div className="mt-5 rounded-sm border border-ink/20 bg-white p-5">
          <h3 className="font-display text-lg text-ink">
            {draft.id ? "Edit question" : "New question"}
          </h3>
          {error ? <p className="mt-2 font-body text-sm text-[#8a2f2f]">{error}</p> : null}
          <label className="mt-4 block">
            <span className="font-body text-xs font-medium text-ink/70">Question</span>
            <input
              type="text"
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
              className={`mt-1 ${field}`}
            />
          </label>
          <label className="mt-4 block">
            <span className="font-body text-xs font-medium text-ink/70">Answer</span>
            <textarea
              rows={5}
              value={draft.answer}
              onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              className={`mt-1 ${field} resize-y`}
            />
          </label>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className={`${btn} bg-gold text-ink disabled:opacity-60`}
            >
              {busy ? "Saving..." : "Save question"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className={`${btn} border border-ink/25 text-ink`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <ul className="mt-5 divide-y divide-ink/10 rounded-sm border border-ink/15 bg-white">
        {items.length === 0 ? (
          <li className="p-5 font-body text-sm text-ink/60">
            No questions yet. Add your first one above.
          </li>
        ) : null}
        {items.map((item, i) => (
          <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold text-ink">
                {item.question}
                {item.visible !== 1 ? (
                  <span className="ml-2 rounded-sm bg-ink/10 px-1.5 py-0.5 font-body text-[0.65rem] uppercase tracking-wide text-ink/60">
                    Hidden
                  </span>
                ) : null}
              </p>
              <p className="mt-1 line-clamp-2 font-body text-xs leading-relaxed text-ink/60">
                {item.answer}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => move(item, "up")}
                disabled={i === 0}
                className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                aria-label={`Move "${item.question}" up`}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => move(item, "down")}
                disabled={i === items.length - 1}
                className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                aria-label={`Move "${item.question}" down`}
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(item)}
                className={`${btn} border border-ink/25 text-ink`}
              >
                {item.visible === 1 ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setDraft({ id: item.id, question: item.question, answer: item.answer });
                }}
                className={`${btn} bg-ink text-beige`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(item)}
                className={`${btn} border border-[#8a2f2f]/40 text-[#8a2f2f]`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
