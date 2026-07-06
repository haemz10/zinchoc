import { useCallback, useEffect, useState } from "react";

import {
  adminChangePassword,
  adminClearSiteImage,
  adminClearStripeKey,
  adminGetSettings,
  adminResetColors,
  adminSaveColors,
  adminSaveSettings,
  adminSetStripeKey,
} from "../../lib/api/admin.functions";
import { BRAND_COLOR_KEYS, HEX_COLOR_RE, type Settings } from "../../lib/types";

// Admin settings tab: business details (contact email, Instagram, ABN, name,
// announcement) plus the two site image slots (hero, atelier story) uploaded to
// R2. The footer and legal pages read these values from D1.

const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";
const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";

type SlotId = "hero" | "story" | "logo";

const SLOTS: { id: SlotId; label: string; hint: string }[] = [
  {
    id: "hero",
    label: "Hero photograph",
    hint: "Landscape, at least 2000px wide. Shown full bleed at the top of the home page with the scroll reveal.",
  },
  {
    id: "story",
    label: "Atelier story photograph",
    hint: "Portrait 4:5. Shown beside the brand story. Until uploaded, a composed brand panel is shown instead.",
  },
  {
    id: "logo",
    label: "Brand logo",
    hint: "Your heart-and-eye mark. PNG with transparent or white background, used in the header and footer exactly as uploaded.",
  },
];

export function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<SlotId | null>(null);
  const [stripeMasked, setStripeMasked] = useState("");
  const [passwordSet, setPasswordSet] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [stripeKeyInput, setStripeKeyInput] = useState("");
  const [stripeBusy, setStripeBusy] = useState(false);
  const [stripeMessage, setStripeMessage] = useState("");
  const [colorsBusy, setColorsBusy] = useState(false);
  const [colorsMessage, setColorsMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // All hooks are declared above this line; the loading return below must stay
  // after the last hook (Rules of Hooks).

  const refresh = useCallback(async () => {
    const res = await adminGetSettings();
    setSettings(res.settings);
    setStripeMasked(res.stripe_key_masked);
    setPasswordSet(res.admin_password_set);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!settings) {
    return <p className="font-body text-sm text-ink/60">Loading settings...</p>;
  }

  const set = (key: keyof Settings, value: string) => {
    setSaved(false);
    setSettings({ ...settings, [key]: value });
  };

  async function save() {
    if (!settings) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await adminSaveSettings({
        data: {
          contact_email: settings.contact_email,
          instagram_url: settings.instagram_url,
          abn: settings.abn,
          business_name: settings.business_name,
          announcement: settings.announcement,
          faq_public: settings.faq_public === "1" ? ("1" as const) : ("0" as const),
          show_story: settings.show_story === "0" ? ("0" as const) : ("1" as const),
          show_process: settings.show_process === "0" ? ("0" as const) : ("1" as const),
          show_gallery: settings.show_gallery === "0" ? ("0" as const) : ("1" as const),
          show_collection_wedding:
            settings.show_collection_wedding === "0" ? ("0" as const) : ("1" as const),
          show_collection_art:
            settings.show_collection_art === "0" ? ("0" as const) : ("1" as const),
          hero_headline: settings.hero_headline,
          hero_subline: settings.hero_subline,
          story_heading: settings.story_heading,
          story_body: settings.story_body,
          closing_line_1: settings.closing_line_1,
          collection_intro: settings.collection_intro,
          order_notes_hint: settings.order_notes_hint,
          paypal_email: settings.paypal_email,
          bank_account_name: settings.bank_account_name,
          bank_bsb: settings.bank_bsb,
          bank_account_number: settings.bank_account_number,
          stripe_payment_link: settings.stripe_payment_link,
        },
      });
      setSaved(true);
    } catch {
      setError("Could not save settings. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadSlot(slot: SlotId, file: File) {
    setError("");
    setUploadingSlot(slot);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target", "site");
      form.append("slot", slot);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) setError(json.error ?? "Upload failed.");
      await refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function clearSlot(slot: SlotId) {
    await adminClearSiteImage({ data: { slot } });
    await refresh();
  }

  async function changePassword() {
    setPasswordMessage(null);
    if (newPassword.length < 10) {
      setPasswordMessage({ ok: false, text: "The new password needs at least 10 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ ok: false, text: "The two passwords do not match." });
      return;
    }
    setPasswordBusy(true);
    try {
      await adminChangePassword({ data: { password: newPassword } });
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ ok: true, text: "Password changed. Use it from your next sign in." });
      await refresh();
    } catch {
      setPasswordMessage({ ok: false, text: "Could not change the password. Please try again." });
    } finally {
      setPasswordBusy(false);
    }
  }

  async function saveStripeKey() {
    if (!stripeKeyInput.trim()) return; // empty means leave unchanged
    setStripeBusy(true);
    setStripeMessage("");
    try {
      const res = await adminSetStripeKey({ data: { key: stripeKeyInput.trim() } });
      setStripeKeyInput("");
      setStripeMasked(res.masked);
      setStripeMessage("Stripe key saved. Card payments are live.");
    } catch {
      setStripeMessage("Could not save the key. Please try again.");
    } finally {
      setStripeBusy(false);
    }
  }

  function toColorInput(value: string): string {
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
      const [r, g, b] = value.slice(1);
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return "#000000";
  }

  async function saveColors() {
    if (!settings) return;
    setColorsMessage(null);
    for (const key of BRAND_COLOR_KEYS) {
      if (!HEX_COLOR_RE.test(settings[key])) {
        setColorsMessage({
          ok: false,
          text: "One of the colours is not a valid hex value (#rgb or #rrggbb). Nothing was saved.",
        });
        return;
      }
    }
    setColorsBusy(true);
    try {
      const res = await adminSaveColors({
        data: {
          color_ground: settings.color_ground,
          color_panel: settings.color_panel,
          color_ink: settings.color_ink,
          color_gold: settings.color_gold,
          color_silver: settings.color_silver,
        },
      });
      if (res.ok) {
        setColorsMessage({ ok: true, text: "Colours saved. Reload any open page to see them." });
        await refresh();
      } else {
        setColorsMessage({ ok: false, text: res.error });
        await refresh();
      }
    } catch {
      setColorsMessage({ ok: false, text: "Could not save the colours. Please try again." });
    } finally {
      setColorsBusy(false);
    }
  }

  async function resetColors() {
    setColorsBusy(true);
    setColorsMessage(null);
    try {
      await adminResetColors();
      setColorsMessage({ ok: true, text: "Colours reset to the original design." });
      await refresh();
    } catch {
      setColorsMessage({ ok: false, text: "Could not reset the colours. Please try again." });
    } finally {
      setColorsBusy(false);
    }
  }

  async function clearStripeKey() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Remove the stored Stripe key? Card payments via Stripe will stop.")
    ) {
      return;
    }
    setStripeBusy(true);
    setStripeMessage("");
    try {
      const res = await adminClearStripeKey();
      setStripeMasked(res.masked);
      setStripeMessage("Stored Stripe key removed.");
    } catch {
      setStripeMessage("Could not remove the key. Please try again.");
    } finally {
      setStripeBusy(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl text-ink">Settings</h2>

      {error ? (
        <p className="mt-3 rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-3 py-2 font-body text-sm text-[#8a2f2f]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 max-w-xl space-y-4 rounded-sm border border-ink/15 bg-white p-5">
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Business name</span>
          <input
            type="text"
            value={settings.business_name}
            onChange={(e) => set("business_name", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Contact email</span>
          <input
            type="email"
            value={settings.contact_email}
            onChange={(e) => set("contact_email", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Instagram URL</span>
          <input
            type="url"
            value={settings.instagram_url}
            onChange={(e) => set("instagram_url", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">ABN</span>
          <input
            type="text"
            value={settings.abn}
            onChange={(e) => set("abn", e.target.value)}
            className={`mt-1 ${field}`}
          />
          <span className="mt-1 block font-body text-xs text-ink/55">
            This must be your registered ABN before trading. It appears in the footer and on every
            legal page.
          </span>
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">
            Announcement line (optional; when filled it appears as a slim strip above the header on
            every page)
          </span>
          <input
            type="text"
            value={settings.announcement}
            onChange={(e) => set("announcement", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={settings.faq_public === "1"}
            onChange={(e) => set("faq_public", e.target.checked ? "1" : "0")}
            className="mt-1 h-4 w-4 shrink-0 accent-gold"
          />
          <span className="font-body text-sm leading-relaxed text-ink/80">
            FAQ public
            <span className="mt-0.5 block font-body text-xs text-ink/55">
              When off, the questions page and its links are hidden from visitors. You still see
              them while signed in.
            </span>
          </span>
        </label>
        <h3 className="border-t border-ink/10 pt-4 font-display text-base text-ink">Sections</h3>
        <p className="font-body text-xs text-ink/55">
          Turn parts of the site on or off. Hidden sections disappear for visitors immediately; you
          still see the gallery while signed in.
        </p>
        {(
          [
            { key: "show_story", label: "Story section (the atelier)" },
            { key: "show_process", label: "How commissioning works" },
            { key: "show_collection_wedding", label: "Collection: wedding pieces" },
            { key: "show_collection_art", label: "Collection: art bonbon boxes" },
            { key: "show_gallery", label: "Gallery page" },
          ] as const
        ).map((section) => (
          <label key={section.key} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={settings[section.key] !== "0"}
              onChange={(e) => set(section.key, e.target.checked ? "1" : "0")}
              className="mt-1 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="font-body text-sm leading-relaxed text-ink/80">{section.label}</span>
          </label>
        ))}

        <h3 className="border-t border-ink/10 pt-4 font-display text-base text-ink">Site copy</h3>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Hero headline</span>
          <input
            type="text"
            value={settings.hero_headline}
            onChange={(e) => set("hero_headline", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Hero subline</span>
          <textarea
            rows={3}
            value={settings.hero_subline}
            onChange={(e) => set("hero_subline", e.target.value)}
            className={`mt-1 ${field} resize-y`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Story heading</span>
          <input
            type="text"
            value={settings.story_heading}
            onChange={(e) => set("story_heading", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">
            Story text (blank line between paragraphs)
          </span>
          <textarea
            rows={7}
            value={settings.story_body}
            onChange={(e) => set("story_body", e.target.value)}
            className={`mt-1 ${field} resize-y`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">Collection introduction</span>
          <textarea
            rows={3}
            value={settings.collection_intro}
            onChange={(e) => set("collection_intro", e.target.value)}
            className={`mt-1 ${field} resize-y`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">
            Closing line (under "Dates for the coming season are limited")
          </span>
          <input
            type="text"
            value={settings.closing_line_1}
            onChange={(e) => set("closing_line_1", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">
            Order form notes hint (empty shows no hint)
          </span>
          <input
            type="text"
            value={settings.order_notes_hint}
            onChange={(e) => set("order_notes_hint", e.target.value)}
            className={`mt-1 ${field}`}
          />
        </label>

        <h3 className="border-t border-ink/10 pt-4 font-display text-base text-ink">Payments</h3>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">PayPal email</span>
          <input
            type="email"
            value={settings.paypal_email}
            onChange={(e) => set("paypal_email", e.target.value)}
            className={`mt-1 ${field}`}
          />
          <span className="mt-1 block font-body text-xs text-ink/55">
            Customers pay to this address (card payments run as PayPal guest checkout). It must be a
            PayPal Business account to receive payments. Leave empty to hide the PayPal option.
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="font-body text-xs font-medium text-ink/70">Bank account name</span>
            <input
              type="text"
              value={settings.bank_account_name}
              onChange={(e) => set("bank_account_name", e.target.value)}
              className={`mt-1 ${field}`}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="font-body text-xs font-medium text-ink/70">BSB</span>
            <input
              type="text"
              value={settings.bank_bsb}
              onChange={(e) => set("bank_bsb", e.target.value)}
              className={`mt-1 ${field}`}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="font-body text-xs font-medium text-ink/70">Account number</span>
            <input
              type="text"
              value={settings.bank_account_number}
              onChange={(e) => set("bank_account_number", e.target.value)}
              className={`mt-1 ${field}`}
            />
          </label>
        </div>
        <p className="font-body text-xs text-ink/55">
          Bank transfer details appear on the payment step only when all three fields are set.
        </p>
        <label className="block">
          <span className="font-body text-xs font-medium text-ink/70">
            Card payment link (optional, e.g. a Stripe Payment Link)
          </span>
          <input
            type="url"
            value={settings.stripe_payment_link}
            onChange={(e) => set("stripe_payment_link", e.target.value)}
            className={`mt-1 ${field}`}
          />
          <span className="mt-1 block font-body text-xs text-ink/55">
            The link is a fallback only; when a Stripe key is configured below (or as a deploy
            secret), card payments run live through Stripe Checkout instead.
          </span>
        </label>
        <div className="rounded-sm border border-ink/10 bg-panel/50 p-4">
          <p className="font-body text-xs font-medium text-ink/70">Stripe secret key</p>
          <p className="mt-1 font-body text-xs text-ink/55">
            {stripeMasked
              ? `Card payments are live via Stripe Checkout (key ${stripeMasked}).`
              : "No key configured; the card option is hidden at checkout. Paste a restricted Stripe secret key to activate card payments."}
          </p>
          <input
            type="password"
            value={stripeKeyInput}
            onChange={(e) => setStripeKeyInput(e.target.value)}
            placeholder="Paste new key (leave empty to keep current)"
            autoComplete="off"
            aria-label="New Stripe secret key"
            className={`mt-2 ${field}`}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={saveStripeKey}
              disabled={stripeBusy || !stripeKeyInput.trim()}
              className={`${btn} bg-ink text-beige disabled:opacity-50`}
            >
              {stripeBusy ? "Working..." : "Save key"}
            </button>
            {stripeMasked ? (
              <button
                type="button"
                onClick={clearStripeKey}
                disabled={stripeBusy}
                className={`${btn} border border-[#8a2f2f]/40 text-[#8a2f2f] disabled:opacity-50`}
              >
                Clear key
              </button>
            ) : null}
            {stripeMessage ? (
              <span className="font-body text-xs text-ink/60">{stripeMessage}</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className={`${btn} bg-gold text-ink disabled:opacity-60`}
          >
            {busy ? "Saving..." : "Save settings"}
          </button>
          {saved ? <span className="font-body text-xs text-ink/60">Saved.</span> : null}
        </div>
      </div>

      <h3 className="mt-8 font-display text-lg text-ink">Site photographs</h3>
      <p className="mt-1 max-w-xl font-body text-sm text-ink/65">
        The public site launches with composed brand panels. Upload your real photography here to
        replace them; JPEG, PNG or WebP up to 5MB.
      </p>
      <div className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-2">
        {SLOTS.map((slot) => {
          const key =
            slot.id === "hero"
              ? settings.hero_image_key
              : slot.id === "story"
                ? settings.story_image_key
                : settings.logo_image_key;
          return (
            <div key={slot.id} className="rounded-sm border border-ink/15 bg-white p-4">
              <p className="font-body text-sm font-semibold text-ink">{slot.label}</p>
              <p className="mt-1 font-body text-xs text-ink/55">{slot.hint}</p>
              <div className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-sm bg-panel">
                {key ? (
                  <img
                    src={`/img/${key}`}
                    alt={`${slot.label} preview`}
                    className={`h-full w-full ${slot.id === "logo" ? "object-contain p-2" : "object-cover"}`}
                  />
                ) : (
                  <span className="font-body text-xs uppercase tracking-wide text-ink/40">
                    Not set
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <label className={`${btn} cursor-pointer border border-ink/25 text-ink`}>
                  {uploadingSlot === slot.id ? "Uploading..." : key ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadSlot(slot.id, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {key ? (
                  <button
                    type="button"
                    onClick={() => clearSlot(slot.id)}
                    className={`${btn} border border-ink/25 text-ink/70`}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="mt-8 font-display text-lg text-ink">Brand colours</h3>
      <div className="mt-3 max-w-xl rounded-sm border border-ink/15 bg-white p-5">
        <p className="font-body text-xs leading-relaxed text-ink/60">
          These five colours style the whole site. Very light ink or very dark ground can make text
          hard to read; keep strong contrast between ink and ground, and check the site after
          saving.
        </p>
        {colorsMessage ? (
          <p
            className={`mt-2 font-body text-xs ${colorsMessage.ok ? "text-ink/70" : "text-[#8a2f2f]"}`}
          >
            {colorsMessage.text}
          </p>
        ) : null}
        <div className="mt-3 space-y-3">
          {(
            [
              { key: "color_ground", label: "Ground (page background)" },
              { key: "color_panel", label: "Panel (tinted sections)" },
              { key: "color_ink", label: "Ink (text)" },
              { key: "color_gold", label: "Gold (accent)" },
              { key: "color_silver", label: "Silver (hairlines)" },
            ] as const
          ).map((color) => (
            <div key={color.key} className="flex items-center gap-3">
              <input
                type="color"
                value={toColorInput(settings[color.key])}
                onChange={(e) => set(color.key, e.target.value)}
                aria-label={`${color.label} picker`}
                className="h-9 w-12 shrink-0 cursor-pointer rounded-sm border border-ink/25 bg-white p-0.5"
              />
              <input
                type="text"
                value={settings[color.key]}
                onChange={(e) => set(color.key, e.target.value)}
                aria-label={`${color.label} hex value`}
                className={`w-28 rounded-sm border px-2 py-1.5 font-mono text-xs text-ink focus:outline-none ${
                  HEX_COLOR_RE.test(settings[color.key])
                    ? "border-ink/25 bg-white focus:border-gold"
                    : "border-[#8a2f2f]/60 bg-[#8a2f2f]/5"
                }`}
              />
              <span className="font-body text-sm text-ink/75">{color.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={saveColors}
            disabled={colorsBusy}
            className={`${btn} bg-gold text-ink disabled:opacity-60`}
          >
            {colorsBusy ? "Working..." : "Save colours"}
          </button>
          <button
            type="button"
            onClick={resetColors}
            disabled={colorsBusy}
            className={`${btn} border border-ink/25 text-ink disabled:opacity-60`}
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <h3 className="mt-8 font-display text-lg text-ink">Change admin password</h3>
      <div className="mt-3 max-w-xl rounded-sm border border-ink/15 bg-white p-5">
        <p className="font-body text-xs leading-relaxed text-ink/60">
          {passwordSet
            ? "You sign in with a password set from this screen."
            : "You currently sign in with the deploy-time password. Setting one here replaces it."}
        </p>
        <p className="mt-2 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 font-body text-xs leading-relaxed text-ink">
          Keep the new password somewhere safe. If you forget it, resetting requires developer
          access to this website.
        </p>
        {passwordMessage ? (
          <p
            className={`mt-2 font-body text-xs ${passwordMessage.ok ? "text-ink/70" : "text-[#8a2f2f]"}`}
          >
            {passwordMessage.text}
          </p>
        ) : null}
        <label className="mt-3 block">
          <span className="font-body text-xs font-medium text-ink/70">
            New password (at least 10 characters)
          </span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="mt-3 block">
          <span className="font-body text-xs font-medium text-ink/70">Confirm new password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={`mt-1 ${field}`}
          />
        </label>
        <button
          type="button"
          onClick={changePassword}
          disabled={passwordBusy || !newPassword || !confirmPassword}
          className={`${btn} mt-3 bg-ink text-beige disabled:opacity-50`}
        >
          {passwordBusy ? "Changing..." : "Change password"}
        </button>
      </div>
    </div>
  );
}
