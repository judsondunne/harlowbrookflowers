import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Sale",
  description: "Terms for ordering bouquets and gift subscriptions from Harlow Brook Flowers.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of sale"
      updated="October 24, 2026"
      reviewItems={[
        "Cancellation and refund windows (48 hours proposed)",
        "Missed-pickup policy",
        "Subscription make-up bouquet policy for weather",
        "Sales tax obligations and pricing",
        "Business legal name and governing law",
        "Legal review before launch",
      ]}
    >
      <p>
        These terms apply when you buy bouquets or gift subscriptions from Harlow Brook Flowers through this website. By
        placing an order, you agree to them.
      </p>

      <h2>Seasonal flowers</h2>
      <p>
        Our flowers are grown outdoors in Vermont and picked for each pickup day. Every bouquet is made from what is
        blooming that week, so colors, varieties and stem counts vary. Photos on this site show the style and approximate
        size of each bouquet and are not a promise of the exact flowers you will receive. Vases shown in photos are for
        styling and are not included.
      </p>

      <h2>Prices and payment</h2>
      <p>
        Prices are shown in US dollars. Pickup is free. If sales tax applies, it is shown before you pay. Payment is taken
        in full at checkout through Stripe. An order is confirmed once payment succeeds and you receive a confirmation.
      </p>

      <h2>Pickup</h2>
      <p>
        Orders are collected at the farm in Hartland, Vermont, during the pickup window you choose. The address is provided
        in your confirmation. Please collect your flowers during your window; cut flowers cannot be held for long. If you
        cannot make your pickup, contact us as soon as possible and we will try to arrange another time.
      </p>

      <h2>Changes and cancellations</h2>
      <p>
        You may change your pickup day or cancel for a full refund by contacting us at least 48 hours before your pickup
        window begins. Within 48 hours your flowers may already be cut, and we will do what we reasonably can. If we ever
        need to cancel a pickup (for example because of weather or crop failure), we will offer another date or a full
        refund.
      </p>

      <h2>Gift subscriptions</h2>
      <ul>
        <li>Subscriptions are prepaid for a fixed number of monthly bouquets and do not renew.</li>
        <li>Bouquets are collected in Hartland on pickup dates we share with the recipient or purchaser before each month.</li>
        <li>If a month&apos;s bouquet cannot be picked because of weather, we will arrange a make-up bouquet within the season.</li>
        <li>Unused bouquets are not exchangeable for cash, except where a refund is required by law or offered by us.</li>
        <li>
          If you need to cancel a subscription before it begins, contact us and we will refund you in full. Once bouquets
          have been collected, refunds for remaining months are at our discretion.
        </li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions about these terms or your order: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
