import { useCallback, useEffect, useState } from "react";

import {
  adminGetSettings,
  adminListLegalPages,
  adminSaveLegalPage,
  adminSetPageVisible,
} from "../../lib/api/admin.functions";
import type { LegalPage, Settings } from "../../lib/types";

// Admin Pages tab: edit the legal pages (privacy, terms, shipping-refunds).
// Body uses the simple format the public renderer understands: "## " section
// headings, "- " list items, blank-line paragraphs, **bold**, and the
// {{abn}} / {{contact_email}} tokens.

const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";
const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";

type Slug = "privacy" | "terms" | "shipping-refunds";

const VISIBILITY_KEY: Record<Slug, keyof Settings> = {
  privacy: "show_page_privacy",
  terms: "show_page_terms",
  "shipping-refunds": "show_page_shipping",
};

export function PagesTab() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Slug>("privacy");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [res, settingsRes] = await Promise.all([adminListLegalPages(), adminGetSettings()]);
      setPages(res.pages);
      setSettings(settingsRes.settings);
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

        {settings ? (
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={settings[VISIBILITY_KEY[selected]] !== "0"}
              onChange={async (e) => {
                const visible = e.target.checked;
                const previous = settings[VISIBILITY_KEY[selected]];
                setError("");
                // Optimistic: flip immediately, revert if the server rejects.
                setSettings({ ...settings, [VISIBILITY_KEY[selected]]: visible ? "1" : "0" });
                try {
                  await adminSetPageVisible({ data: { slug: selected, visible } });
                } catch {
                  setSettings({ ...settings, [VISIBILITY_KEY[selected]]: previous });
                  setError("Could not change the page visibility. Please try again.");
                }
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="font-body text-sm leading-relaxed text-ink/80">
              Show this page on the website
              <span className="mt-0.5 block font-body text-xs text-ink/55">
                When off, the page and its footer link are hidden from visitors. The content stays
                saved here, and you still see the page while signed in.
              </span>
            </span>
          </label>
        ) : null}

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
