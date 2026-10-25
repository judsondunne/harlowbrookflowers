import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, PageIntro } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { getSettings } from "@/server/settings";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Local Flower Pickup in Hartland, VT · How Ordering Works",
  absoluteTitle: true,
  description:
    "How to order fresh cut flowers from Harlow Brook Flowers: choose a bouquet, pick a pickup day, pay securely online, and collect at the farm in Hartland, Vermont.",
  path: "/how-it-works",
});

export default async function HowItWorksPage() {
  const settings = await getSettings();
  const cutoff = settings.orderCutoffHours;
  const steps = [
    {
      title: "Choose your flowers",
      text: "Pick a bouquet size: the Little Posy, the Garden Bouquet or the Harlow Brook Bunch. Add a free handwritten card if it's a gift.",
    },
    {
      title: "Choose a pickup day",
      text: `Pickup days are posted through the season, each with a set time and a limited number of bouquets. Orders for a day close about ${cutoff} hours beforehand so Sarah can plan what to pick.`,
    },
    {
      title: "Pay securely",
      text: "Checkout takes a minute and needs no account. Payment is handled by Stripe; we never see your card details. You'll get a confirmation email straight away.",
    },
    {
      title: "Collect in Hartland",
      text: "Your confirmation includes the pickup address and directions. Arrive any time during your pickup window, give your name, and your bouquet is waiting.",
    },
  ];
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ])}
      />
      <PageIntro eyebrow="How it works" title="Ordered ahead. Picked for you. Collected at the farm.">
        <p>
          Harlow Brook is a small flower farm, not a florist with a shop, so ordering works a little differently. Here is
          everything you need to know.
        </p>
      </PageIntro>

      <section className="container-page pb-20">
        <ol className="grid gap-x-10 border-t border-ink sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.title} className="border-b border-line py-7 lg:border-b-0">
              <h2 className="t-h3">{s.title}</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-paper">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Photo src="/images/photos/wrapped-bouquets.webp" className="aspect-[4/3]" sizes="(max-width:1024px) 90vw, 40vw" />
          </div>
          <div className="space-y-10 lg:col-span-6 lg:col-start-7">
            <div>
              <Eyebrow>Pickup day</Eyebrow>
              <h2 className="t-h2 mt-3">What to expect</h2>
            </div>
            {[
              ["Where", `${settings.pickupLocationPublic}. The farm is a private home, so the exact address is shared only in your confirmation.`],
              ["When", "During the pickup window you chose. Bouquets are cut for that day, so please collect them within your window."],
              ["Who", "You, or anyone you send. Add their name in the checkout note."],
              ["Bring", "Nothing but yourself. Your bouquet comes wrapped and ready to carry home."],
              ["If plans change", "Write to us as soon as you can and we'll do our best to find another time."],
            ].map(([t, d]) => (
              <div key={t} className="grid gap-2 border-t border-line pt-5 sm:grid-cols-[9rem_1fr]">
                <h3 className="font-display font-medium text-[1.1875rem] leading-snug">{t}</h3>
                <p className="text-[0.9375rem] leading-relaxed text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Eyebrow>Gifts</Eyebrow>
          <h2 className="t-h2 mt-3">Giving flowers? Even easier.</h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
            For a single bouquet, add a handwritten card and let the recipient collect it, or pick it up and deliver it
            yourself. For something that lasts, a gift subscription gives monthly bouquets through the season with one
            payment. Sarah handles the pickup dates with the recipient directly.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            <ButtonLink href="/subscriptions">Flower subscriptions</ButtonLink>
            <Link href="/gift-flowers" className="link-rule">
              Flower gift ideas
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Photo src="/images/photos/zinnias-mason-jar.webp" className="aspect-[4/5]" sizes="(max-width:1024px) 90vw, 40vw" />
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
          <p className="t-h3">Still have a question?</p>
          <div className="flex flex-wrap gap-x-6">
            <Link href="/faq" className="link-rule">
              Read the FAQ
            </Link>
            <Link href="/guides/fresh-cut-flowers-upper-valley" className="link-rule">
              Driving times to Hartland
            </Link>
            <Link href="/contact" className="link-rule">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
