import { createFileRoute } from "@tanstack/react-router";

import { StructuredData } from "../components/StructuredData";
import { H2, P, PageHeader, PageShell, Prose } from "../components/site/PageShell";
import { replaceTokens } from "../components/site/SimpleMarkdown";
import { getFaqPageData } from "../lib/api/public.functions";

// FAQ page, rendered from the owner-editable faq_items table (admin FAQ tab).
// Private until the owner flips faq_public in Settings; admin sessions always
// see it, with a notice.

export const Route = createFileRoute("/faq")({
  loader: async () => getFaqPageData(),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const title = "Questions | Zin Choc";
    const description =
      "Allergens, dietary options, lead times, delivery, storage, payment terms and more for Zin Choc wedding chocolate bomboniere.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(origin ? [{ property: "og:url", content: `${origin}/faq` }] : []),
      ],
      links: origin ? [{ rel: "canonical", href: `${origin}/faq` }] : [],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  const { settings, faqVisible, galleryVisible, isAdmin, items } = Route.useLoaderData();

  if (!faqVisible) {
    return (
      <PageShell settings={settings} showFaq={false} showGallery={galleryVisible}>
        <div className="mx-auto max-w-2xl px-5 py-24 text-center md:py-32">
          <h1 className="font-display text-3xl leading-tight text-ink md:text-4xl">
            This page is private
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-ink/75">
            Our questions page is not published yet. If you would like to know anything about our
            chocolate, we would love to hear from you.
          </p>
          <a
            href="/#enquiry"
            className="mt-8 inline-block font-body text-sm text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold"
          >
            Tell us about your day
          </a>
        </div>
      </PageShell>
    );
  }

  const resolved = items.map((item) => ({
    ...item,
    answer: replaceTokens(item.answer, settings),
  }));

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: resolved.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });

  return (
    <PageShell settings={settings} showFaq={faqVisible} showGallery={galleryVisible}>
      <StructuredData json={jsonLd} />
      {isAdmin && settings.faq_public !== "1" ? (
        <p className="border-b border-gold/40 bg-gold/10 px-5 py-2.5 text-center font-body text-xs tracking-wide text-ink">
          Visible to admins only. Make the FAQ public from admin Settings.
        </p>
      ) : null}
      <PageHeader
        eyebrow="Questions"
        title="Frequently asked questions"
        intro="A few of the things couples ask us most. If your question is not here, we would love to hear it."
      />
      <Prose>
        {resolved.map((item) => (
          <section key={item.id}>
            <H2>{item.question}</H2>
            <P>{item.answer}</P>
          </section>
        ))}
      </Prose>
    </PageShell>
  );
}
