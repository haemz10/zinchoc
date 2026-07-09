import { useCallback, useEffect, useRef, useState } from "react";

import {
  adminDeleteProduct,
  adminListProducts,
  adminMoveProduct,
  adminSaveProduct,
  adminSetVisible,
} from "../../lib/api/admin.functions";
import { formatAud, type Product } from "../../lib/types";

// Admin products tab: list, create, edit, hide/show, reorder, delete with
// confirm, image upload to R2 with thumbnail preview.

type Draft = {
  id?: number;
  slug: string;
  name: string;
  description: string;
  price: string; // dollars, e.g. "12.50"
  unit: string;
  min_order: string;
  sort: string;
  visible: boolean;
  category: string;
};

const EMPTY_DRAFT: Draft = {
  slug: "",
  name: "",
  description: "",
  price: "",
  unit: "per piece",
  min_order: "50",
  sort: "0",
  visible: true,
  category: "wedding",
};

const field =
  "w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none";
const btn =
  "inline-flex items-center rounded-sm px-3 py-1.5 font-body text-xs font-medium transition-transform active:scale-[0.98]";

function draftFromProduct(p: Product): Draft {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: (p.price_cents / 100).toFixed(2),
    unit: p.unit,
    min_order: String(p.min_order),
    sort: String(p.sort),
    visible: p.visible === 1,
    category: p.category === "art" ? "art" : "wedding",
  };
}

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveError, setSaveError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputs = useRef(new Map<number, HTMLInputElement>());

  const refresh = useCallback(async () => {
    try {
      const res = await adminListProducts();
      setProducts(res.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function save() {
    if (!draft) return;
    setSaveError("");
    const priceCents = Math.round(Number.parseFloat(draft.price || "0") * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setSaveError("Please enter a valid price in dollars.");
      return;
    }
    setBusy(true);
    try {
      const res = await adminSaveProduct({
        data: {
          id: draft.id,
          slug: draft.slug.trim().toLowerCase(),
          name: draft.name.trim(),
          description: draft.description.trim(),
          price_cents: priceCents,
          unit: draft.unit.trim(),
          min_order: Number.parseInt(draft.min_order || "1", 10) || 1,
          sort: Number.parseInt(draft.sort || "0", 10) || 0,
          visible: draft.visible,
          category: draft.category === "art" ? ("art" as const) : ("wedding" as const),
        },
      });
      if (res.ok) {
        setDraft(null);
        await refresh();
      } else {
        setSaveError(res.error ?? "Could not save the product.");
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save the product.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: Product) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete "${p.name}"? This cannot be undone.`)
    ) {
      return;
    }
    await adminDeleteProduct({ data: { id: p.id } });
    await refresh();
  }

  async function toggleVisible(p: Product) {
    await adminSetVisible({ data: { id: p.id, visible: p.visible !== 1 } });
    await refresh();
  }

  async function move(p: Product, dir: "up" | "down") {
    await adminMoveProduct({ data: { id: p.id, dir } });
    await refresh();
  }

  async function uploadImage(p: Product, file: File) {
    setUploadError("");
    setUploadingId(p.id);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target", "product");
      form.append("product_id", String(p.id));
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) setUploadError(json.error ?? "Upload failed.");
      await refresh();
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploadingId(null);
    }
  }

  if (loading) {
    return <p className="font-body text-sm text-ink/60">Loading products...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-ink">Products</h2>
        <button
          type="button"
          onClick={() => {
            setSaveError("");
            setDraft({ ...EMPTY_DRAFT, sort: String(products.length + 1) });
          }}
          className={`${btn} bg-ink text-beige`}
        >
          Add product
        </button>
      </div>

      {uploadError ? (
        <p className="mt-3 rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-3 py-2 font-body text-sm text-[#8a2f2f]">
          {uploadError}
        </p>
      ) : null}

      {draft ? (
        <div className="mt-5 rounded-sm border border-ink/20 bg-white p-5">
          <h3 className="font-display text-lg text-ink">
            {draft.id ? "Edit product" : "New product"}
          </h3>
          {saveError ? <p className="mt-2 font-body text-sm text-[#8a2f2f]">{saveError}</p> : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">Name</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">
                Slug (lowercase, hyphens)
              </span>
              <input
                type="text"
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="font-body text-xs font-medium text-ink/70">Description</span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className={`mt-1 ${field} resize-y`}
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">Price (AUD)</span>
              <input
                type="text"
                inputMode="decimal"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">
                Unit (e.g. per piece, per box of 2)
              </span>
              <input
                type="text"
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">Category</span>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className={`mt-1 ${field}`}
              >
                <option value="wedding">Wedding</option>
                <option value="art">Art</option>
              </select>
            </label>
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">Minimum order</span>
              <input
                type="number"
                min="1"
                value={draft.min_order}
                onChange={(e) => setDraft({ ...draft, min_order: e.target.value })}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="block">
              <span className="font-body text-xs font-medium text-ink/70">Sort order</span>
              <input
                type="number"
                min="0"
                value={draft.sort}
                onChange={(e) => setDraft({ ...draft, sort: e.target.value })}
                className={`mt-1 ${field}`}
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.visible}
                onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
                className="h-4 w-4 accent-gold"
              />
              <span className="font-body text-sm text-ink/80">Visible on the public site</span>
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className={`${btn} bg-gold text-ink disabled:opacity-60`}
            >
              {busy ? "Saving..." : "Save product"}
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
        {products.length === 0 ? (
          <li className="p-5 font-body text-sm text-ink/60">
            No products yet. Add your first piece above.
          </li>
        ) : null}
        {products.map((p, i) => (
          <li key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-panel">
              {p.image_key ? (
                <img
                  src={`/img/${p.image_key}`}
                  alt={`${p.name} thumbnail`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-1 text-center font-body text-[0.6rem] uppercase tracking-wide text-ink/40">
                  No photo
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold text-ink">
                {p.name} <span className="font-normal text-ink/50">({p.slug})</span>
                {p.visible !== 1 ? (
                  <span className="ml-2 rounded-sm bg-ink/10 px-1.5 py-0.5 font-body text-[0.65rem] uppercase tracking-wide text-ink/60">
                    Hidden
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 font-body text-xs text-ink/60">
                {formatAud(p.price_cents)} {p.unit}, minimum {p.min_order},{" "}
                {p.category === "art" ? "art" : "wedding"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => move(p, "up")}
                disabled={i === 0}
                className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                aria-label={`Move ${p.name} up`}
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => move(p, "down")}
                disabled={i === products.length - 1}
                className={`${btn} border border-ink/25 text-ink disabled:opacity-30`}
                aria-label={`Move ${p.name} down`}
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => toggleVisible(p)}
                className={`${btn} border border-ink/25 text-ink`}
              >
                {p.visible === 1 ? "Hide" : "Show"}
              </button>
              <label className={`${btn} cursor-pointer border border-ink/25 text-ink`}>
                {uploadingId === p.id
                  ? "Uploading..."
                  : p.image_key
                    ? "Replace photo"
                    : "Upload photo"}
                <input
                  ref={(el) => {
                    if (el) fileInputs.current.set(p.id, el);
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(p, f);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setSaveError("");
                  setDraft(draftFromProduct(p));
                }}
                className={`${btn} bg-ink text-beige`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p)}
                className={`${btn} border border-[#8a2f2f]/40 text-[#8a2f2f]`}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-body text-xs text-ink/50">
        Photos: JPEG, PNG or WebP, up to 5MB. Portrait 4:5 crops look best in the collection grid.
      </p>
    </div>
  );
}
