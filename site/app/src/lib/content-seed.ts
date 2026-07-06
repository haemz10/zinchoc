// Client-safe seed content: the launch FAQ list and legal page bodies.
// This is the in-code fallback used when the D1 binding is not yet
// provisioned, and the single source the 0004_cms.sql migration seeds were
// generated from. The owner edits the live versions in admin; these defaults
// only matter for a fresh database.
import type { FaqItem, LegalPage } from "./types";

export const SEED_FAQS: FaqItem[] = [
  {
    id: 1,
    sort: 1,
    visible: 1,
    question: "What is in your chocolate, and what about allergens?",
    answer:
      "We work with fine couverture chocolate made from cocoa mass, cocoa butter, sugar and, in milk and white varieties, milk solids. Fillings may include cream, butter, nuts, fruit and spirits. Our kitchen handles nuts, dairy, soy, gluten and egg, so all products may contain traces of these allergens even where they are not listed ingredients. A full ingredient and allergen list is supplied with every order, and we are happy to share it before you book. If any of your guests have a severe allergy, please tell us at enquiry so we can advise honestly on what we can and cannot guarantee.",
  },
  {
    id: 2,
    sort: 2,
    visible: 1,
    question: "Do you offer vegan or dietary-specific options?",
    answer:
      "Yes. Dairy-free dark chocolate pieces, vegan ganaches and alcohol-free fillings are available across most of the collection. Gluten is not an ingredient in most of our range, though we cannot certify products as gluten free because of shared equipment. Tell us what you need and we will design around it.",
  },
  {
    id: 3,
    sort: 3,
    visible: 1,
    question: "How far in advance should we order?",
    answer:
      "Our lead time is four to six weeks from design approval, and popular dates book out earlier. For weddings in October to March, we suggest enquiring three to four months ahead. If your date is closer than six weeks, write to us anyway. If we can take it on, we will.",
  },
  {
    id: 4,
    sort: 4,
    visible: 1,
    question: "Where do you deliver?",
    answer:
      "Australia-wide. Metropolitan Sydney deliveries are made by our own cold-chain courier; interstate orders travel in insulated, temperature-controlled packaging with express carriers. We schedule every delivery around your wedding date so the chocolate arrives fresh, usually two to four days before the day. International orders are considered case by case, so please enquire with your destination and date.",
  },
  {
    id: 5,
    sort: 5,
    visible: 1,
    question: "How should we store the chocolate before the wedding?",
    answer:
      "Keep boxes sealed, in a cool, dry, dark place between 15 and 20 degrees, away from strong smells. Chocolate does not like the fridge: condensation dulls the finish and can mark hand-painted work. Stored well, your bomboniere will be perfect on the day and for several weeks after.",
  },
  {
    id: 6,
    sort: 6,
    visible: 1,
    question: "How does the custom design process work?",
    answer:
      "It begins with a conversation about your wedding, then a tasting, then a written design proposal covering flavours, finishes, monograms or motifs, and packaging. You approve every detail before production begins. Small refinements are welcome up to three weeks before delivery; larger changes may adjust the quote or timeline.",
  },
  {
    id: 7,
    sort: 7,
    visible: 1,
    question: "What are your payment terms?",
    answer:
      "A 50% deposit confirms your date and design, and production is scheduled once it is received. The balance is due two weeks before delivery. We accept bank transfer and card payment, and all prices include GST.",
  },
  {
    id: 8,
    sort: 8,
    visible: 1,
    question: "What if we need to cancel or change our date?",
    answer:
      "Life happens, and weddings move. If you postpone, we will transfer your booking to a new date where our calendar allows, at no charge. If you cancel before production begins, we refund everything except costs already incurred on your design and any custom moulds or packaging. Once production has started, the deposit is non-refundable because your pieces are made only for you. None of this limits your rights under the Australian Consumer Law.",
  },
  {
    id: 9,
    sort: 9,
    visible: 1,
    question: "Something else?",
    answer: "Email {{contact_email}} and we will reply within two business days.",
  },
];

const PRIVACY_BODY = `Zin Choc ({{abn}}) respects your privacy. This policy explains what personal information we collect, why we collect it, how we hold it, and your rights. We handle personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). For visitors in the European Union, United Kingdom and other regions with comparable privacy laws, we also apply the additional protections described in the section "Visitors outside Australia" below.

## 1. What we collect

When you contact us through our enquiry or order form, by email or by social media, we may collect:

- your name and, where relevant, your partner's name
- your email address and phone number
- your wedding or event details, such as the date, venue location, guest numbers and delivery address
- your design preferences, dietary and allergen requirements relevant to your order
- payment records, such as invoices and receipts (card payments are processed by our payment provider; we do not store full card numbers)
- any other information you choose to give us in correspondence.

We only collect information that we need to respond to your enquiry and to design, make and deliver your order. We do not collect sensitive information unless you provide it voluntarily and it is relevant to your order, for example a medical allergy affecting ingredients.

## 2. Why we collect it

We collect and use personal information to:

- respond to enquiries and provide quotes
- arrange tastings and consultations
- design, produce and deliver your order
- process payments and keep business records required by law, including tax law
- communicate with you about your booking.

We will only send you marketing material, such as news of seasonal collections, if you have asked to receive it, and every message will include a simple way to unsubscribe. We comply with the Spam Act 2003 (Cth).

## 3. How we hold and protect your information

Your information is stored in password-protected email, cloud storage and business software accounts used by Zin Choc, some of which may be hosted on servers outside Australia by reputable providers. We take reasonable steps to protect personal information from misuse, interference, loss, and unauthorised access, modification or disclosure. We keep records only as long as needed for the purposes above or as required by law, then delete or de-identify them.

## 4. We do not sell your data

We do not sell, rent or trade personal information. We share it only with service providers who need it to fulfil your order, such as couriers for delivery and payment processors for payment, and where we are required to disclose it by law.

## 5. Cookies

This website does not use tracking cookies, advertising cookies or analytics profiling. If we ever introduce cookies that are not strictly necessary for the site to function, we will update this policy and ask for your consent first.

## 6. Visitors outside Australia

If you visit us or enquire from a region covered by the EU or UK General Data Protection Regulation:

- **Lawful basis.** We process your information to take steps at your request before entering a contract and to perform that contract (your order), for our legitimate interest in responding to enquiries, to comply with legal obligations, and with your consent for any marketing.
- **Your rights.** You may request access to, correction of, or erasure of your personal information, ask us to restrict or object to processing, request a copy of your data in a portable format, and withdraw consent at any time. We will respond within one month.
- **Complaints.** You may also lodge a complaint with your local data protection authority.

## 7. Access, correction and privacy requests

You may ask at any time what personal information we hold about you, ask us to correct it, or ask us to delete it (subject to records we must keep by law). Contact us by email at {{contact_email}}. We will respond within a reasonable time, normally within 30 days, and will not charge you for making a request.

## 8. Complaints

If you believe we have mishandled your personal information, please contact us first at the email above and we will investigate and respond. If you are not satisfied with our response, you may complain to the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au or on 1300 363 992.

## 9. Changes to this policy

We may update this policy from time to time. The current version will always be published on this page with its date of last update.`;

const TERMS_BODY = `These terms apply to all quotes, orders and sales of Zin Choc ({{abn}}) products ("goods"). By paying a deposit you accept these terms. Nothing in these terms excludes, restricts or modifies any right or guarantee you have under the Australian Consumer Law (ACL) that cannot lawfully be excluded.

## 1. Quotes and orders

1.1 Quotes are valid for 30 days from the date issued. Prices are in Australian dollars and include GST. Delivery is quoted separately.

1.2 All goods are made to order for your wedding or event. An order is confirmed, and your date reserved, only when we receive your signed design approval and the deposit described in clause 2.

1.3 Our standard lead time is four to six weeks from design approval. Shorter timelines may be accepted at our discretion.

## 2. Deposit and payment

2.1 A deposit of 50% of the order total is payable to confirm your booking and reserve your date.

2.2 The balance is payable no later than two weeks before the agreed delivery date. We may withhold delivery until payment is received in full.

2.3 If the balance remains unpaid after a reminder and the delivery date is at risk, we may treat the order as cancelled by you under clause 6.

## 3. Custom goods and change requests

3.1 Designs, flavours, quantities and packaging are set out in the written design proposal you approve. Please check it carefully; goods are produced to the approved proposal.

3.2 Minor changes requested up to three weeks before delivery will be accommodated where practical. Changes that affect materials, quantities, custom moulds or packaging may adjust the price and timeline, which we will confirm in writing before proceeding.

3.3 Handmade goods vary slightly from piece to piece and from photographs. Reasonable variation in shade, lustre, brushwork and finish is a characteristic of the craft, not a fault.

## 4. Delivery and risk

4.1 Delivery dates are scheduled around your wedding date and confirmed in writing. You must ensure someone is available to receive and appropriately store the goods at the delivery address.

4.2 Chocolate is temperature sensitive. Goods are dispatched in insulated, cold-chain packaging. Risk in the goods passes to you on delivery to the agreed address. Title passes on payment in full.

4.3 We are not liable for delay or deterioration caused by events outside our reasonable control, including courier delays and extreme weather, or by incorrect delivery details or failure to receive or store the goods as instructed. Where a delay is within our control and the goods cannot be supplied for your event, your remedies under clause 7 apply.

## 5. Food safety and allergens

5.1 Our products may contain, or contain traces of, nuts, dairy, soy, gluten and egg. All goods are made in a kitchen that handles these allergens, and we cannot guarantee any product is free of them.

5.2 An ingredient and allergen list is supplied with every order. You are responsible for communicating allergen information to your guests. If you tell us about specific allergies, we will advise honestly on what we can and cannot accommodate.

5.3 Storage instructions accompany every order. Goods must be stored as instructed; we are not responsible for deterioration caused by storage contrary to those instructions after delivery.

## 6. Cancellation and change of mind

6.1 If you cancel before production begins, we will refund amounts paid less costs reasonably incurred, including design work, custom moulds, bespoke packaging and ingredients already purchased for your order.

6.2 Once production has begun, the deposit is non-refundable and you remain liable for costs incurred up to cancellation, because the goods are custom made and cannot be resold.

6.3 If you postpone your wedding, we will transfer your booking to a new date free of charge where our calendar allows.

6.4 Because the goods are made to your specification, we do not offer refunds or exchanges for change of mind, including changes of preference about flavour, colour or design after approval. This does not affect your rights for faulty goods under clause 7.

## 7. Australian Consumer Law and remedies

7.1 Our goods come with guarantees that cannot be excluded under the Australian Consumer Law. For major failures you are entitled to a refund or replacement, and to compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods replaced or refunded if they fail to be of acceptable quality and the failure does not amount to a major failure.

7.2 If goods arrive damaged or faulty, contact us within 24 hours of delivery with photographs of the goods and packaging so we can assess and act quickly, given the perishable and date-critical nature of wedding goods. We will replace the affected goods before your event where time allows, or refund them.

7.3 Nothing in these terms limits your ACL rights. Clause 6 applies only to change of mind, not to faulty goods.

## 8. Liability

8.1 To the extent permitted by law, and other than liability that cannot be excluded under the ACL, our total liability for any claim arising out of an order is limited, at our election, to resupplying the goods or refunding the price paid for them, and we are not liable for indirect or consequential loss.

8.2 Nothing in these terms excludes liability that cannot be excluded by law, including liability for death or personal injury caused by our negligence.

## 9. General

9.1 These terms are governed by the laws of New South Wales, Australia, and you and we submit to the non-exclusive jurisdiction of the courts of New South Wales.

9.2 If any part of these terms is found unenforceable, the rest remains in effect.

9.3 Questions about these terms: {{contact_email}}.`;

const SHIPPING_BODY = `Zin Choc ({{abn}}).

## How we ship chocolate

Chocolate is temperature sensitive, and we treat every parcel accordingly. All orders travel in insulated packaging with food-grade cooling elements, sealed and packed on the day of dispatch. In warm months, and always for deliveries to Queensland, the Northern Territory and northern Western Australia, we dispatch early in the week with express services so parcels never sit in a depot over a weekend.

- **Sydney metropolitan:** delivered by our own cold-chain courier, with a confirmed delivery window.
- **Elsewhere in Australia:** express carriers with tracking, in cold-chain packaging.
- Delivery costs are quoted with your order and depend on destination, order size and season.

## Delivery timeframes and your wedding date

Every order is scheduled around your wedding. We agree a delivery window with you at booking, normally two to four days before your event, so the chocolate arrives fresh with time to spare. We confirm the dispatch date in writing and send tracking details on the day of dispatch.

Please make sure someone can receive the parcel on the delivery day and move it promptly to a cool, dry place between 15 and 20 degrees, out of direct sunlight and away from strong smells. Storage instructions are included with every order.

## If your order arrives damaged

We pack carefully, but couriers are not always kind. If your order arrives damaged or affected by heat:

- Contact us at {{contact_email}} within 24 hours of delivery.
- Include photographs of the outer packaging and the affected goods. Please keep the packaging until we have responded.
- We will assess immediately, and because wedding dates do not move, our first priority is remaking and re-dispatching the affected pieces in time for your event. Where that is not possible, we will refund the affected goods, including a proportionate share of delivery.

These remedies reflect your rights under the Australian Consumer Law. If a failure is major, you are entitled to choose a refund or replacement.

## Change of mind

All Zin Choc pieces are custom made for your wedding and cannot be resold, so we do not offer refunds or exchanges for change of mind after design approval, including preferences about flavour, colour or design. This does not affect your rights for faulty or damaged goods, which are always covered as described above and under the Australian Consumer Law. Cancellation and postponement terms are set out in our Terms of Sale.

## International orders

We consider international deliveries case by case, depending on destination, season and customs rules for food imports. Email {{contact_email}} with your destination country, wedding date and approximate quantities and we will advise what is possible. International recipients are responsible for any import duties, taxes and customs requirements at the destination.

## Questions

Email {{contact_email}} and we will reply within two business days.`;

export const SEED_LEGAL_PAGES: LegalPage[] = [
  { slug: "privacy", title: "Privacy Policy", body: PRIVACY_BODY, updated_at: "2026-07-05" },
  { slug: "terms", title: "Terms of Sale", body: TERMS_BODY, updated_at: "2026-07-05" },
  {
    slug: "shipping-refunds",
    title: "Shipping and Refunds",
    body: SHIPPING_BODY,
    updated_at: "2026-07-05",
  },
];
