import { createFileRoute } from "@tanstack/react-router";

import { HeartEyeMark } from "../components/site/HeartEyeMark";
import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHeader } from "../components/site/SiteHeader";
import { getGalleryData } from "../lib/api/public.functions";

// Gallery of the atelier's work: a masonry-style column grid of photographs
// uploaded through admin (R2, served via /img/<key>), captions beneath.
// Collapses to two columns on mobile. Composed empty state when no images yet.

export const Route = createFileRoute("/gallery")({
  loader: async () => getGalleryData(),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const title = "Gallery | Zin Choc";
    const description =
      "Photographs from the Zin Choc atelier: wedding bomboniere and art bonbon boxes, finished by hand in cocoa butter, gold and silver.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(origin ? [{ property: "og:url", content: `${origin}/gallery` }] : []),
      ],
      links: origin ? [{ rel: "canonical", href: `${origin}/gallery` }] : [],
    };
  },
  component: GalleryPage,
});

function GalleryPage() {
  const { settings, images, faqVisible, galleryVisible, isAdmin } = Route.useLoaderData();

  if (!galleryVisible) {
    return (
      <>
        <SiteHeader settings={settings} showFaq={faqVisible} showGallery={false} />
        <main className="bg-beige">
          <div className="mx-auto max-w-2xl px-5 py-24 text-center md:py-32">
            <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">
              This page is private
            </h1>
            <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-ink/75">
              Our gallery is not published yet. The collection is the best introduction to our work
              in the meantime.
            </p>
            <a
              href="/#collection"
              className="mt-8 inline-block font-body text-sm text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
            >
              View the collection
            </a>
          </div>
        </main>
        <SiteFooter settings={settings} showFaq={faqVisible} />
      </>
    );
  }

  return (
    <>
      <SiteHeader settings={settings} showFaq={faqVisible} showGallery={galleryVisible} />
      <main className="bg-beige">
        {isAdmin && settings.show_gallery !== "1" ? (
          <p className="border-b border-gold/40 bg-gold/10 px-5 py-2.5 text-center font-body text-xs tracking-wide text-ink">
            Visible to admins only. Turn the gallery on from admin Settings.
          </p>
        ) : null}
        <header className="border-b border-silver/40 bg-panel">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">Gallery</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              From the atelier
            </h1>
            <p className="mt-5 max-w-[65ch] font-body text-base leading-relaxed text-ink/75">
              Pieces we have made and moments from the bench: wedding bomboniere, art bonbon boxes,
              and the quiet work in between. Every photograph is our own.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 rounded-sm bg-ink px-6 py-24 text-center">
              {settings.logo_image_key ? (
                <img
                  src={`/img/${settings.logo_image_key}`}
                  alt=""
                  aria-hidden="true"
                  className="h-16 w-16 object-contain opacity-80 brightness-0 invert"
                />
              ) : (
                <HeartEyeMark variant="silver" className="h-16 w-16 opacity-80" />
              )}
              <p className="max-w-[36ch] font-body text-sm leading-relaxed text-beige/80">
                {settings.gallery_empty_text}
              </p>
              <a
                href="/#collection"
                className="font-body text-sm text-beige underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
              >
                View the collection
              </a>
            </div>
          ) : (
            <div className="columns-2 gap-4 md:columns-3 md:gap-6">
              {images.map((img) => (
                <figure key={img.id} className="mb-4 break-inside-avoid md:mb-6">
                  <img
                    src={`/img/${img.image_key}`}
                    alt={img.caption?.trim() || "Handcrafted Zin Choc chocolate from the atelier"}
                    loading="lazy"
                    className="w-full rounded-sm object-cover"
                  />
                  {img.caption?.trim() ? (
                    <figcaption className="mt-2 font-body text-xs leading-relaxed text-ink/60">
                      {img.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter settings={settings} showFaq={faqVisible} />
    </>
  );
}
