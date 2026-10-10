import { useCallback, useEffect, useState } from "react";

import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  adminMoveCategory,
  adminUpdateCategory,
} from "../../lib/api/admin.functions";
import type { Category } from "../../lib/types";

// Admin categories tab: the collection groups shown on the home page. The owner
// can add, rename, reorder, show/hide and delete them. Products are assigned to
// a category from the Products tab; deleting a category moves its products to
// the first remaining one so nothing is orphaned.

const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";
const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await adminListCategories();
      setCategories(res.categories);
      setLabels(Object.fromEntries(res.categories.map((c) => [c.id, c.label])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addCategory() {
    if (!newLabel.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminCreateCategory({ data: { label: newLabel.trim() } });
      setNewLabel("");
      await refresh();
    } catch {
      setError("Could not add the category. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveLabel(c: Category) {
    const label = (labels[c.id] ?? c.label).trim();
    if (!label || label === c.label) return;
    try {
      await adminUpdateCategory({ data: { id: c.id, label, visible: c.visible === 1 } });
      await refresh();
    } catch {
      setError("Could not rename the category. Please try again.");
    }
  }

  async function toggleVisible(c: Category) {
    const label = (labels[c.id] ?? c.label).trim() || c.label;
    await adminUpdateCategory({ data: { id: c.id, label, visible: c.visible !== 1 } });
    await refresh();
  }

  async function move(c: Category, dir: "up" | "down") {
    await adminMoveCategory({ data: { id: c.id, dir } });
    await refresh();
  }

  async function remove(c: Category) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Delete "${c.label}"? Any products in it move to the first remaining category. This cannot be undone.`,
      )
    ) {
      return;
    }
    await adminDeleteCategory({ data: { id: c.id } });
    await refresh();
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading categories...</p>;
  }

  return (
    <div>
      <h2 className="font-display text-xl text-ink">Categories</h2>
      <p className="mt-1 max-w-2xl font-body text-sm text-ink/65">
        These are the collection groups shown on the home page, in this order. Rename, reorder, show
        or hide, and delete them. Assign each product to a category from the Products tab.
      </p>

      {error ? (
        <p className="mt-3 rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-3 py-2 font-body text-sm text-[#8a2f2f]">
          {error}
        </p>
      ) : null}

      <ul className="mt-5 divide-y divide-ink/10 rounded-sm border border-ink/15 bg-white">
        {categories.length === 0 ? (
          <li className="p-5 font-body text-sm text-ink/60">
            No categories yet. Add your first one below.
          </li>
        ) : null}
        {categories.map((c, i) => (
          <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={labels[c.id] ?? c.label}
                onChange={(e) => setLabels((m) => ({ ...m, [c.id]: e.target.value }))}
                onBlur={() => saveLabel(c)}
                aria-label={`Category name for ${c.label}`}
                className={field}
              />
              <p className="mt-1 font-body text-[0.7rem] text-ink/45">
                web key: <span className="font-mono">{c.key}</span>
                {c.visible !== 1 ? " · hidden from the site" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => move(c, "up")}
                disabled={i === 0}
                className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                aria-label={`Move ${c.label} up`}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => move(c, "down")}
                disabled={i === categories.length - 1}
                className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                aria-label={`Move ${c.label} down`}
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(c)}
                className={`${btn} border border-ink/25 text-ink`}
              >
                {c.visible === 1 ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => saveLabel(c)}
                className={`${btn} bg-ink text-beige`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => remove(c)}
                className={`${btn} border border-[#8a2f2f]/40 text-[#8a2f2f]`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void addCategory();
          }}
          placeholder="New category name, e.g. Gift Boxes"
          className={field}
        />
        <button
          type="button"
          onClick={addCategory}
          disabled={busy || !newLabel.trim()}
          className={`${btn} shrink-0 bg-gold text-ink disabled:opacity-60`}
        >
          {busy ? "Adding..." : "Add category"}
        </button>
      </div>
    </div>
  );
}
