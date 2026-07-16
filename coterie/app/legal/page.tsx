import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy & Terms — Coterie",
  description:
    "Coterie's privacy policy and terms of service — what we collect, how it's used, and the rules for using the platform.",
};

const UPDATED = "July 2026";

export default function LegalPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-16">
        <span className="text-sm font-semibold uppercase tracking-widest text-clay">
          Legal
        </span>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
          Privacy &amp; Terms
        </h1>
        <p className="mt-2 text-sm text-ink/50">Last updated: {UPDATED}</p>

        <div className="mt-8 max-w-2xl space-y-10 leading-relaxed text-ink/75">
          {/* ---------- Privacy ---------- */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Privacy Policy
            </h2>
            <p className="mt-3">
              Coterie is a member-owned community platform. We keep this simple:
              we collect only what we need to run the service, we don&apos;t
              track you for advertisers, and we never sell your data.
            </p>

            <H3>What we collect</H3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Account details</strong> — your email address, a
                username, and a display name.
              </li>
              <li>
                <strong>Content you create</strong> — communities, posts,
                comments, marketplace listings, and any images you upload.
              </li>
              <li>
                <strong>Messages</strong> — direct messages you send to other
                members about listings.
              </li>
              <li>
                <strong>Basic technical data</strong> — standard information
                needed to keep you signed in and keep the service secure.
              </li>
            </ul>

            <H3>How we use it</H3>
            <p className="mt-2">
              To create and secure your account, show your content to the
              communities you post in, let members message each other about
              items, and operate and improve the platform. We do not use your
              data for advertising and we do not sell it.
            </p>

            <H3>Who can see your content</H3>
            <p className="mt-2">
              Posts, comments, communities, and listings are public within the
              site — anyone can view them. Direct messages are visible only to
              you and the member you&apos;re messaging. Your email address is
              never shown to other members.
            </p>

            <H3>Service providers</H3>
            <p className="mt-2">
              We use Supabase for authentication, database, and file storage,
              and Vercel for hosting. These providers process data on our behalf
              to run the service.
            </p>

            <H3>Your choices</H3>
            <p className="mt-2">
              You can edit or delete your posts, comments, listings, and
              communities at any time. You can request deletion of your account
              and associated data. Reset your password from the sign-in screen.
            </p>

            <H3>Children</H3>
            <p className="mt-2">
              Coterie is not directed to children under 13 (or the minimum age
              in your country), and they should not use the service.
            </p>
          </section>

          {/* ---------- Terms ---------- */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Terms of Service
            </h2>
            <p className="mt-3">
              By creating an account or using Coterie, you agree to these terms.
            </p>

            <H3>Your account</H3>
            <p className="mt-2">
              You&apos;re responsible for activity on your account and for
              keeping your password secure. Provide accurate information and
              don&apos;t impersonate others.
            </p>

            <H3>Your content</H3>
            <p className="mt-2">
              You keep ownership of what you post. By posting, you grant Coterie
              a limited license to display and distribute that content within
              the service so it can be shown to other members. You&apos;re
              responsible for the content you share and must have the right to
              share it.
            </p>

            <H3>Acceptable use</H3>
            <p className="mt-2">Don&apos;t use Coterie to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                post illegal, hateful, harassing, or sexually exploitative
                content;
              </li>
              <li>spam, scam, or deceive other members;</li>
              <li>
                infringe others&apos; intellectual property or privacy; or
              </li>
              <li>
                break the platform, scrape it, or attempt to bypass its
                security.
              </li>
            </ul>
            <p className="mt-2">
              Members can report content, and we may remove content or suspend
              accounts that violate these terms.
            </p>

            <H3>The marketplace</H3>
            <p className="mt-2">
              Coterie provides a place for members to list and discover
              goods, but is <strong>not a party to any transaction</strong>.
              Buyers and sellers arrange payment and delivery directly. Coterie
              takes no cut and makes no guarantee about items, sellers, or
              buyers — use your judgement and transact carefully.
            </p>

            <H3>Disclaimers &amp; liability</H3>
            <p className="mt-2">
              The service is provided &quot;as is&quot; without warranties. To
              the extent permitted by law, Coterie isn&apos;t liable for
              indirect or consequential damages, or for disputes between
              members, including marketplace transactions.
            </p>

            <H3>Changes &amp; termination</H3>
            <p className="mt-2">
              We may update these terms and will post changes here. You can stop
              using Coterie and delete your account at any time. We may suspend
              accounts that break these terms.
            </p>
          </section>

          <p className="text-sm text-ink/50">
            This page will continue to be updated as the platform grows.
          </p>
        </div>

        <a
          href="/"
          className="mt-10 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5"
        >
          ← Back to home
        </a>
      </main>
      <SiteFooter />
    </>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 font-serif text-lg font-semibold text-ink">
      {children}
    </h3>
  );
}
