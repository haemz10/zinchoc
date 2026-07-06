import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageShell, Prose } from "../components/site/PageShell";
import { SimpleMarkdown } from "../components/site/SimpleMarkdown";
import { getLegalPageData } from "../lib/api/public.functions";

// Shipping and Refunds: rendered from the owner-editable legal_pages table (admin Pages
// tab), through the SimpleMarkdown renderer. {{abn}} and {{contact_email}}
// tokens resolve from settings at render.

export const Route = createFileRoute("/shipping-refunds")({
  loader: async () => getLegalPageData({ data: { slug: "shipping-refunds" } }),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const title = "Shipping and Refunds | Zin Choc";
    const description = "How Zin Choc ships temperature-sensitive chocolate cold-chain across Australia, and how damaged orders and refunds are handled under Australian Consumer Law.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, nofollow" },
        ...(origin ? [{ property: "og:url", content: `${origin}/shipping-refunds` }] : []),
      ],
      links: origin ? [{ rel: "canonical", href: `${origin}/shipping-refunds` }] : [],
    };
  },
  component: ShippingPage,
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

function ShippingPage() {
  const { settings, faqVisible, galleryVisible, page } = Route.useLoaderData();
  return (
    <PageShell settings={settings} showFaq={faqVisible} showGallery={galleryVisible}>
      <PageHeader
        title={page?.title ?? "Shipping and Refunds"}
        abn={settings.abn}
        lastUpdated={formatUpdated(page?.updated_at ?? null)}
      />
      <Prose>{page ? <SimpleMarkdown body={page.body} settings={settings} /> : null}</Prose>
    </PageShell>
  );
}
