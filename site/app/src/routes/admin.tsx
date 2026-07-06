import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EnquiriesTab } from "../components/admin/EnquiriesTab";
import { FaqTab } from "../components/admin/FaqTab";
import { GalleryTab } from "../components/admin/GalleryTab";
import { PagesTab } from "../components/admin/PagesTab";
import { OrdersTab } from "../components/admin/OrdersTab";
import { ProductsTab } from "../components/admin/ProductsTab";
import { SettingsTab } from "../components/admin/SettingsTab";
import { HeartEyeMark } from "../components/site/HeartEyeMark";
import { getAdminState } from "../lib/api/admin.functions";

// Owner admin. Plain and functional, same type family as the public site, no
// public theatrics. Auth state is resolved server-side (signed httpOnly
// cookie); every data function re-verifies the session on the server.

type AdminSearch = { error?: string };

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  loader: async () => getAdminState(),
  head: () => ({
    meta: [
      { title: "Admin | Zin Choc" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "products", label: "Products" },
  { id: "gallery", label: "Gallery" },
  { id: "orders", label: "Orders" },
  { id: "enquiries", label: "Enquiries" },
  { id: "faq", label: "FAQ" },
  { id: "pages", label: "Pages" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminPage() {
  const { configured, authed, dbReady } = Route.useLoaderData();
  const { error } = Route.useSearch();
  const [tab, setTab] = useState<TabId>("products");

  if (!configured) {
    return (
      <AdminShell>
        <div className="mx-auto mt-16 max-w-md rounded-sm border border-ink/15 bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-ink">Admin is not configured yet</h1>
          <p className="mt-4 font-body text-sm leading-relaxed text-ink/70">
            Set the ADMIN_PASSWORD secret for this website, then reload this page to sign in. A
            SESSION_SECRET can also be set for cookie signing; otherwise one is derived from the
            admin password.
          </p>
        </div>
      </AdminShell>
    );
  }

  if (!authed) {
    return (
      <AdminShell>
        <div className="mx-auto mt-16 max-w-sm rounded-sm border border-ink/15 bg-white p-8">
          <h1 className="font-display text-2xl text-ink">Owner sign in</h1>
          {error === "rate" ? (
            <p className="mt-3 rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-3 py-2 font-body text-sm text-[#8a2f2f]">
              Too many attempts. Please wait 15 minutes and try again.
            </p>
          ) : error === "pw" ? (
            <p className="mt-3 rounded-sm border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-3 py-2 font-body text-sm text-[#8a2f2f]">
              That password is not right. Please try again.
            </p>
          ) : null}
          <form method="post" action="/api/admin/login" className="mt-5">
            <label htmlFor="admin-password" className="font-body text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1.5 w-full rounded-sm border border-ink/25 bg-white px-3 py-2 font-body text-sm text-ink focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-sm bg-ink px-4 py-2.5 font-body text-sm font-medium text-beige transition-transform active:scale-[0.98]"
            >
              Sign in
            </button>
          </form>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      right={
        <form method="post" action="/api/admin/logout">
          <button
            type="submit"
            className="rounded-sm border border-ink/25 px-3 py-1.5 font-body text-xs font-medium text-ink transition-transform active:scale-[0.98]"
          >
            Sign out
          </button>
        </form>
      }
    >
      {!dbReady ? (
        <p className="mt-6 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 font-body text-sm text-ink">
          The database is not provisioned yet, so products, enquiries and settings cannot be
          edited. Deploy the site once and reload.
        </p>
      ) : null}

      <nav className="mt-8 flex gap-1 border-b border-ink/15" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`-mb-px rounded-t-sm border-b-2 px-4 py-2.5 font-body text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-gold text-ink"
                : "border-transparent text-ink/55 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "products" ? <ProductsTab /> : null}
        {tab === "gallery" ? <GalleryTab /> : null}
        {tab === "orders" ? <OrdersTab /> : null}
        {tab === "enquiries" ? <EnquiriesTab /> : null}
        {tab === "faq" ? <FaqTab /> : null}
        {tab === "pages" ? <PagesTab /> : null}
        {tab === "settings" ? <SettingsTab /> : null}
      </div>
    </AdminShell>
  );
}

function AdminShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-beige">
      <header className="border-b border-ink/15 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-3" aria-label="Back to the public site">
            <HeartEyeMark variant="ink" className="h-7 w-7" />
            <span className="font-display text-base uppercase tracking-[0.24em] text-ink">
              Zin Choc admin
            </span>
          </a>
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-24">{children}</main>
    </div>
  );
}
