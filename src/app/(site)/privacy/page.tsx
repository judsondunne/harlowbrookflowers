import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Harlow Brook Flowers collects, uses and protects your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="October 24, 2026"
      reviewItems={[
        "Business legal name and contact details",
        "Whether Google Analytics will be enabled",
        "Data retention periods for orders and messages",
        "Email provider and any newsletter tool",
        "Legal review for Vermont and US requirements",
      ]}
    >
      <p>
        Harlow Brook Flowers (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a small flower farm in Hartland, Vermont. This policy
        explains what information we collect through this website, why, and the choices you have. We collect as little as
        we can.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>When you order:</strong> your name, email address, optional phone number, any note you add, your pickup
          choice, and the details of what you bought, including gift recipient names, optional recipient emails and card
          messages.
        </li>
        <li>
          <strong>Payments:</strong> handled entirely by Stripe. Your card details go directly to Stripe and are never seen
          or stored by us. Stripe shares the payment status and limited details we need to fulfil your order.
        </li>
        <li>
          <strong>When you contact us:</strong> your name, email and message.
        </li>
        <li>
          <strong>When you join our list:</strong> your email address and a record of the consent you gave.
        </li>
        <li>
          <strong>Your cart:</strong> stored in your own browser (local storage) so it is still there when you return. It
          is not sent to us until you check out.
        </li>
        <li>
          <strong>Basic security data:</strong> to prevent spam and abuse we keep a one-way hashed identifier derived from
          your network address for a short time. We do not store raw IP addresses.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        To process and confirm your order, prepare your flowers, arrange pickup, contact you about your order, respond to
        your messages and, only if you asked, send occasional updates about pickup dates. We do not sell or rent your
        information, and we do not use it for advertising.
      </p>

      <h2>Gift recipients</h2>
      <p>
        If you give a subscription, we use the recipient&apos;s name, and email if you provide it, only to arrange their
        bouquets and, if you choose, send them your note. Please only share a recipient&apos;s email if you believe
        they&apos;d be happy to hear from us about the gift.
      </p>

      <h2>Who we share it with</h2>
      <p>
        Only the services that help us run the shop: Stripe (payments), our website and database hosting providers, and
        our email delivery provider. Each processes data on our behalf. If analytics is enabled, Google Analytics receives
        anonymized usage information, configured without advertising features.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Order records are kept for as long as needed for our business and tax records. Messages and list subscriptions are
        kept until they&apos;re no longer needed or you ask us to delete them.
      </p>

      <h2>Your choices</h2>
      <p>
        You can unsubscribe from our emails at any time, and you can ask us to access, correct or delete your information
        by writing to <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2>Children</h2>
      <p>This site is not directed to children under 13, and we do not knowingly collect their information.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update this page and the date above.</p>
    </LegalPage>
  );
}
