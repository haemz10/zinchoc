import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy & Terms — Coterie",
  description:
    "Coterie's Privacy Policy and Terms of Service. Australian Privacy Principles compliant, with rights recognised for members worldwide.",
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
        <p className="mt-4 max-w-2xl text-sm text-ink/50">
          Coterie is operated from Australia. This Privacy Policy is designed to
          comply with the Australian Privacy Act 1988 (Cth) and the Australian
          Privacy Principles (APPs), and we extend the same core rights to
          members everywhere, including those covered by the EU/UK GDPR. This
          page is provided in good faith and is not legal advice.
        </p>

        <div className="mt-10 max-w-2xl space-y-12 leading-relaxed text-ink/75">
          {/* ================= PRIVACY ================= */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Privacy Policy
            </h2>

            <H3>1. Who we are</H3>
            <p className="mt-2">
              Coterie (&quot;Coterie&quot;, &quot;we&quot;, &quot;us&quot;) is a
              member-owned community platform. We are the entity responsible for
              personal information handled through the service (the &quot;data
              controller&quot; under the GDPR). We keep data collection minimal
              and never sell your personal information.
            </p>

            <H3>2. Information we collect</H3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Account information</strong> — your email address,
                username, display name, and a securely hashed password.
              </li>
              <li>
                <strong>Content you create</strong> — communities, posts,
                comments, marketplace listings, images you upload, and reports
                you file.
              </li>
              <li>
                <strong>Messages</strong> — direct messages you exchange with
                other members about listings.
              </li>
              <li>
                <strong>Technical information</strong> — data necessary to keep
                you signed in, operate the service, and protect it from abuse.
              </li>
            </ul>
            <p className="mt-2">
              We do not collect sensitive information (as defined by the Privacy
              Act) and do not use tracking for advertising.
            </p>

            <H3>3. Why we use it (purposes &amp; legal bases)</H3>
            <p className="mt-2">
              We use personal information to create and secure your account,
              display your content to the communities you post in, enable
              member-to-member messaging, operate and improve the service, and
              keep the platform safe. Under the GDPR, our legal bases are
              performance of our contract with you (providing the service), our
              legitimate interests (security and improvement), and your consent
              where required.
            </p>

            <H3>4. Who can see your information</H3>
            <p className="mt-2">
              Posts, comments, communities, and listings are public within the
              site. Direct messages are visible only to you and the member you
              are messaging. Your email address is never shown to other members.
              We do not sell or rent your personal information to anyone.
            </p>

            <H3>5. Service providers &amp; overseas storage</H3>
            <p className="mt-2">
              We use trusted providers to run Coterie: <strong>Supabase</strong>{" "}
              (authentication, database, and file storage) and{" "}
              <strong>Vercel</strong> (hosting). These providers process data on
              our behalf and may store it on servers located outside Australia,
              including in the United States. In line with APP 8, we take
              reasonable steps to ensure such recipients handle your information
              consistently with this policy. For GDPR transfers, we rely on
              appropriate safeguards such as Standard Contractual Clauses.
            </p>

            <H3>6. Security (APP 11)</H3>
            <p className="mt-2">
              We take reasonable technical and organisational measures to protect
              your information — passwords are hashed, access is governed by
              row-level security, and only you can edit or remove your own
              content. No system is perfectly secure, but we work to keep your
              data safe and to destroy or de-identify it when it is no longer
              needed.
            </p>

            <H3>7. Your rights &amp; choices (APP 12/13 &amp; GDPR)</H3>
            <p className="mt-2">You can, at any time:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>edit or delete your posts, comments, listings, and communities;</li>
              <li>reset your password from the sign-in screen;</li>
              <li>
                request access to the personal information we hold about you, ask
                us to correct it, or request that your account and associated
                data be deleted;
              </li>
              <li>
                where the GDPR applies, exercise rights to restriction, objection,
                and data portability, and withdraw consent.
              </li>
            </ul>

            <H3>8. Data retention</H3>
            <p className="mt-2">
              We keep your information while your account is active. When you
              delete content or your account, the associated data is removed or
              de-identified, except where we must retain limited records to meet
              legal obligations or resolve disputes.
            </p>

            <H3>9. Cookies &amp; essential storage</H3>
            <p className="mt-2">
              We use only the storage necessary to keep you signed in and operate
              the service. We do not use advertising or cross-site tracking
              cookies.
            </p>

            <H3>10. Children</H3>
            <p className="mt-2">
              Coterie is not directed to children under 13 (or the minimum age in
              your jurisdiction), and they should not use the service.
            </p>

            <H3>11. Data breaches</H3>
            <p className="mt-2">
              If a data breach is likely to result in serious harm, we will
              respond in accordance with the Notifiable Data Breaches scheme
              under the Privacy Act and, where applicable, GDPR breach
              notification requirements.
            </p>

            <H3>12. Contact &amp; complaints</H3>
            <p className="mt-2">
              To make a privacy request or raise a concern, contact the Coterie
              team through the platform. We will respond within a reasonable time
              (generally within 30 days). If you are in Australia and are not
              satisfied with our response, you may complain to the Office of the
              Australian Information Commissioner (OAIC) at{" "}
              <a
                href="https://www.oaic.gov.au"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-clay underline-offset-4 hover:underline"
              >
                oaic.gov.au
              </a>
              . If the GDPR applies to you, you may also complain to your local
              supervisory authority.
            </p>
          </section>

          {/* ================= TERMS ================= */}
          <section>
            <h2 className="font-serif text-2xl font-semibold text-ink">
              Terms of Service
            </h2>

            <H3>1. Acceptance</H3>
            <p className="mt-2">
              By creating an account or using Coterie, you agree to these Terms.
              If you do not agree, please don&apos;t use the service.
            </p>

            <H3>2. Eligibility</H3>
            <p className="mt-2">
              You must be at least 13 years old (or the minimum age in your
              country) to use Coterie, and able to form a binding agreement.
            </p>

            <H3>3. Your account</H3>
            <p className="mt-2">
              You&apos;re responsible for activity on your account and for keeping
              your password secure. Provide accurate information and do not
              impersonate others.
            </p>

            <H3>4. Your content</H3>
            <p className="mt-2">
              You keep ownership of what you post. By posting, you grant Coterie a
              non-exclusive, worldwide, royalty-free licence to host, display, and
              distribute that content within the service so it can be shown to
              other members. This licence ends when you delete the content, except
              for copies retained in routine backups for a limited time. You are
              responsible for your content and must have the right to share it.
            </p>

            <H3>5. Acceptable use</H3>
            <p className="mt-2">You must not use Coterie to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                post illegal, hateful, harassing, defamatory, or sexually
                exploitative content;
              </li>
              <li>spam, scam, defraud, or mislead other members;</li>
              <li>infringe others&apos; intellectual property or privacy;</li>
              <li>
                break, scrape, overload, or attempt to bypass the platform&apos;s
                security.
              </li>
            </ul>

            <H3>6. Reporting &amp; moderation</H3>
            <p className="mt-2">
              Members can report content. We may review reports and remove content
              or suspend accounts that breach these Terms, at our discretion.
            </p>

            <H3>7. The marketplace</H3>
            <p className="mt-2">
              Coterie provides a space for members to list and discover goods, but
              is <strong>not a party to any transaction</strong> between members.
              Buyers and sellers arrange payment and delivery directly. Coterie
              takes no commission and makes no warranty about items, sellers, or
              buyers. Transact carefully and comply with any laws that apply to
              what you buy or sell, including consumer and tax laws.
            </p>

            <H3>8. Intellectual property</H3>
            <p className="mt-2">
              The Coterie name, branding, and software are owned by us. These
              Terms don&apos;t grant you rights to them beyond using the service
              as intended.
            </p>

            <H3>9. Disclaimers</H3>
            <p className="mt-2">
              The service is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis without warranties of any kind, to the extent
              permitted by law. Nothing in these Terms excludes rights you have
              under the Australian Consumer Law or other mandatory consumer
              protections that cannot be excluded.
            </p>

            <H3>10. Limitation of liability</H3>
            <p className="mt-2">
              To the extent permitted by law, Coterie is not liable for indirect,
              incidental, or consequential loss, or for disputes between members
              (including marketplace transactions). Where liability cannot be
              excluded, it is limited to re-supplying the service.
            </p>

            <H3>11. Termination</H3>
            <p className="mt-2">
              You can stop using Coterie and delete your account at any time. We
              may suspend or terminate accounts that breach these Terms.
            </p>

            <H3>12. Governing law</H3>
            <p className="mt-2">
              These Terms are governed by the laws of Australia. Courts of
              Australia have non-exclusive jurisdiction, without limiting any
              mandatory consumer rights available to you where you live.
            </p>

            <H3>13. Changes</H3>
            <p className="mt-2">
              We may update these Terms and this Privacy Policy and will post
              changes here with a new &quot;last updated&quot; date. Significant
              changes will be highlighted where practical.
            </p>
          </section>

          <p className="text-sm text-ink/50">
            This page is maintained as the platform grows. It is provided for
            transparency and is not a substitute for professional legal advice.
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
