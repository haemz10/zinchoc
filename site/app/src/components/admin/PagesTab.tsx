import { useCallback, useEffect, useState } from "react";

import { adminListLegalPages, adminSaveLegalPage } from "../../lib/api/admin.functions";
import type { LegalPage } from "../../lib/types";

// Admin Pages tab: edit the legal pages (privacy, terms, shipping-refunds).
// Body uses the simple format the public renderer understands: "## " section
// headings, "- " list items, blank-line paragraphs, **bold**, and the
// {{abn}} / {{contact_email}} tokens.

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";
const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";

type Slug = "privacy" | "terms" | "shipping-refunds";

export function PagesTab() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Slug>("privacy");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await adminListLegalPages();
      setPages(res.pages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const page = pages.find((p) => p.slug === selected);
    if (page) {
      setTitle(page.title);
      setBody(page.body);
      setSaved(false);
      setError("");
    }
  }, [pages, selected]);

  async function save() {
    if (!title.trim() || !body.trim()) {
      setError("Both a title and body are needed.");
      return;
    }
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await adminSaveLegalPage({ data: { slug: selected, title: title.trim(), body } });
      setSaved(true);
      await refresh();
    } catch {
      setError("Could not save the page. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading pages...</p>;
  }

  return (
    <div>
      <h2 className="font-display text-xl text-ink">Pages</h2>
      <p className="mt-2 max-w-2xl font-body text-xs text-ink/55">
        Formatting: start a line with "## " for a section heading and "- " for a list item; leave a
        blank line between paragraphs; wrap words in **double asterisks** for bold. Write{" "}
        {"{{abn}}"} or {"{{contact_email}}"} to insert the current values from Settings. Saving
        updates the "Last updated" date shown on the page.
      </p>

      <div className="mt-5 max-w-3xl rounded-sm border border-ink/15 bg-white p-5">
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Page</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value as Slug)}
            className={`mt-1 ${field}`}
          >
            <option value="privacy">Privacy Policy (/privacy)</option>
            <option value="terms">Terms of Sale (/terms)</option>
            <option value="shipping-refunds">Shipping and Refunds (/shipping-refunds)</option>
          </select>
        </label>

        {error ? <p className="mt-3 font-body text-sm text-[#8a2f2f]">{error}</p> : null}

        <label className="mt-4 block">
          <span className="font-body text-xs font-medium text-ink/70">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
            className={`mt-1 ${field}`}
          />
        </label>

        <label className="mt-4 block">
          <span className="font-body text-xs font-medium text-ink/70">Body</span>
          <textarea
            rows={24}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSaved(false);
            }}
            className={`mt-1 ${field} resize-y font-mono text-xs leading-relaxed`}
          />
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className={`${btn} bg-gold text-ink disabled:opacity-60`}
          >
            {busy ? "Saving..." : "Save page"}
          </button>
          {saved ? <span className="font-body text-xs text-ink/60">Saved.</span> : null}
        </div>
      </div>
    </div>
  );
}
