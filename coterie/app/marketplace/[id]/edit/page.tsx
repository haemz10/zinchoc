"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { uploadImage } from "@/lib/upload";
import { CURRENCIES, currencyLabel, type Currency } from "@/lib/currency";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type Community = { id: string; name: string };

export default function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [buyUrl, setBuyUrl] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      setUserId(uid);
      const { data } = await supabase
        .from("coterie_listings")
        .select("user_id,title,price,currency,buy_url,description,image,community_id")
        .eq("id", params.id)
        .maybeSingle();
      if (!data || data.user_id !== uid) {
        setState("denied");
        return;
      }
      setTitle(data.title);
      setPrice(data.price);
      setCurrency((data.currency as Currency) ?? "USD");
      setBuyUrl(data.buy_url ?? "");
      setDescription(data.description ?? "");
      setCommunityId(data.community_id ?? "");
      setExistingImage(data.image ?? null);
      const { data: comms } = await supabase
        .from("coterie_communities")
        .select("id,name")
        .order("created_at", { ascending: true });
      setCommunities((comms as Community[]) ?? []);
      setState("ready");
    })();
  }, [params.id]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !userId) return;
    setError(null);
    const trimmedBuy = buyUrl.trim();
    if (trimmedBuy && !/^https?:\/\/[^ ]+$/i.test(trimmedBuy)) {
      setError("The buy link must start with http:// or https://");
      return;
    }
    setBusy(true);
    const supabase = supabaseBrowser();

    let imageUrl = existingImage;
    if (file) {
      const up = await uploadImage(supabase, userId, file);
      if (!up) {
        setBusy(false);
        setError("Image upload failed — try a smaller JPG/PNG (under 5MB).");
        return;
      }
      imageUrl = up;
    }

    const { error: updErr } = await supabase
      .from("coterie_listings")
      .update({
        title: title.trim().slice(0, 80),
        price: price.trim().slice(0, 20),
        currency,
        buy_url: trimmedBuy || null,
        description: description.trim().slice(0, 300) || null,
        community_id: communityId || null,
        image: imageUrl,
      })
      .eq("id", params.id);
    setBusy(false);
    if (updErr) {
      setError("Could not save changes. Please try again.");
      return;
    }
    router.push(`/marketplace/${params.id}`);
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-lg rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          {state === "loading" ? (
            <p className="text-ink/50">Loading…</p>
          ) : state === "denied" ? (
            <div className="text-center">
              <h1 className="font-serif text-2xl font-semibold">
                Can&apos;t edit this
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                You can only edit your own listings.
              </p>
              <a
                href="/#marketplace"
                className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream"
              >
                Back to marketplace
              </a>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-3xl font-semibold tracking-tight">
                Edit listing
              </h1>
              <form onSubmit={save} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-ink/15 bg-cream text-ink/30">
                      {preview || existingImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview ?? existingImage ?? ""}
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

                <Labeled label="Title">
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                    className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink/40"
                  />
                </Labeled>

                <Labeled label="Price">
                  <div className="flex gap-2">
                    <select
                      aria-label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="rounded-2xl border border-ink/15 bg-cream px-3 py-3 text-sm outline-none focus:border-ink/40"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {currencyLabel(c)}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      maxLength={20}
                      className="w-full flex-1 rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink/40"
                    />
                  </div>
                </Labeled>

                <Labeled label="Buy link (optional)">
                  <input
                    type="url"
                    value={buyUrl}
                    onChange={(e) => setBuyUrl(e.target.value)}
                    placeholder="https://your-shop.com/item"
                    className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink/40"
                  />
                </Labeled>

                <Labeled label="Description (optional)">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={300}
                    className="w-full resize-none rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-ink/40"
                  />
                </Labeled>

                {communities.length > 0 && (
                  <Labeled label="Community">
                    <select
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
                  </Labeled>
                )}

                {error && (
                  <p role="alert" className="text-sm font-medium text-clay">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <a
                    href={`/marketplace/${params.id}`}
                    className="flex-1 rounded-full border border-ink/15 py-3 text-center text-sm font-semibold text-ink hover:border-ink/40"
                  >
                    Cancel
                  </a>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-full bg-ink py-3 text-sm font-semibold text-cream disabled:opacity-60"
                  >
                    {busy ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/50">
        {label}
      </label>
      {children}
    </div>
  );
}
