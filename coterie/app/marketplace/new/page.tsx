"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { uploadImage } from "@/lib/upload";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Community = { id: string; name: string };

export default function NewListingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setReady(true);
    });
    supabase
      .from("coterie_communities")
      .select("id,name")
      .order("created_at", { ascending: true })
      .then(({ data }) => setCommunities((data as Community[]) ?? []));
  }, []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !userId) return;
    setError(null);

    if (title.trim().length < 2) {
      setError("Give your item a title.");
      return;
    }
    if (!price.trim()) {
      setError("Add a price (e.g. $30, or 'Free').");
      return;
    }

    setBusy(true);
    const supabase = supabaseBrowser();

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await uploadImage(supabase, userId, file);
      if (!imageUrl) {
        setBusy(false);
        setError("Image upload failed — try a smaller JPG/PNG (under 5MB).");
        return;
      }
    }

    const { error: insertErr } = await supabase.from("coterie_listings").insert({
      user_id: userId,
      community_id: communityId || null,
      title: title.trim().slice(0, 80),
      price: price.trim().slice(0, 20),
      description: description.trim().slice(0, 300) || null,
      image: imageUrl,
    });

    if (insertErr) {
      setBusy(false);
      setError("Could not create the listing. Please try again.");
      return;
    }

    router.push("/#marketplace");
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-widest text-clay">
            Marketplace
          </span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            List something you make
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Sell directly to other members. Coterie never takes a cut.
          </p>

          {ready && !userId ? (
            <div className="mt-6 rounded-2xl border border-clay/20 bg-cream p-5 text-center">
              <p className="text-sm text-ink/70">
                You need an account to list an item.
              </p>
              <a
                href="/auth"
                className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
              >
                Join Coterie
              </a>
            </div>
          ) : (
            <form onSubmit={create} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Photo (optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-ink/15 bg-cream text-ink/30">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📷</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onPick}
                    className="text-sm text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream"
                  />
                </div>
              </div>

              <Field id="title" label="Title" value={title} onChange={setTitle} placeholder="e.g. Speckled stoneware mug" max={80} />
              <Field id="price" label="Price" value={price} onChange={setPrice} placeholder="e.g. $38 or Free" max={20} />

              <div>
                <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Materials, size, how to buy…"
                  rows={2}
                  maxLength={300}
                  className="w-full resize-none rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
                />
              </div>

              {communities.length > 0 && (
                <div>
                  <label htmlFor="community" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Community (optional)
                  </label>
                  <select
                    id="community"
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink/40"
                  >
                    <option value="">No community</option>
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm font-medium text-clay">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {busy ? "Publishing…" : "Publish listing"}
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  max,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
        {label}
      </label>
      <input
        id={id}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={max}
        className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-ink/40"
      />
    </div>
  );
}
