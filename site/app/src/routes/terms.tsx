import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageShell, Prose } from "../components/site/PageShell";
import { SimpleMarkdown } from "../components/site/SimpleMarkdown";
import { getLegalPageData } from "../lib/api/public.functions";

// Terms of Sale: rendered from the owner-editable legal_pages table (admin Pages
// tab), through the SimpleMarkdown renderer. {{abn}} and {{contact_email}}
// tokens resolve from settings at render.

export const Route = createFileRoute("/terms")({
  loader: async () => getLegalPageData({ data: { slug: "terms" } }),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const title = "Terms of Sale | Zin Choc";
    const description =
      "Terms of sale for Zin Choc made-to-order wedding chocolate, including deposits, delivery, allergens and your Australian Consumer Law rights.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, nofollow" },
        ...(origin ? [{ property: "og:url", content: `${origin}/terms` }] : []),
      ],
      links: origin ? [{ rel: "canonical", href: `${origin}/terms` }] : [],
    };
  },
  component: TermsPage,
});

function formatUpdated(value: string | null): string {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function TermsPage() {
  const { settings, faqVisible, galleryVisible, page } = Route.useLoaderData();
  return (
    <PageShell settings={settings} showFaq={faqVisible} showGallery={galleryVisible}>
      <PageHeader
        title={page?.title ?? "Terms of Sale"}
        abn={settings.abn}
        lastUpdated={formatUpdated(page?.updated_at ?? null)}
      />
      <Prose>{page ? <SimpleMarkdown body={page.body} settings={settings} /> : null}</Prose>
    </PageShell>
  );
}
