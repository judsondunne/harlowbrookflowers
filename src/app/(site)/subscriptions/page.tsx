import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GiftBuilder, type GiftPlan } from "@/components/subscriptions/gift-builder";
import { AccordionItem } from "@/components/ui/accordion";
import { Eyebrow } from "@/components/ui/typography";
import { Photo } from "@/components/home/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { faqGroups } from "@/content/faq";
import { primaryImage, productAvailability } from "@/domain/catalog";
import { getListedProducts } from "@/server/catalog";
import { getFarmToday } from "@/server/today";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Flower Subscription Gifts · A Season of Vermont Flowers",
  description:
    "Give a prepaid flower subscription from Harlow Brook Flowers: monthly Garden Bouquets through the Vermont growing season, collected in Hartland. One payment, a gift note, no renewals.",
  path: "/subscriptions",
});

export default async function SubscriptionsPage() {
  const [products, today] = await Promise.all([getListedProducts("subscription"), getFarmToday()]);
  const plans: GiftPlan[] = products.map((p) => {
    const a = productAvailability(p, today);
    const img = primaryImage(p, "cutout");
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      priceCents: p.priceCents,
      deliveries: p.deliveries ?? 1,
      startMonths: p.startMonths,
      available: a.state === "available",
      remaining: a.state === "available" ? a.remaining : 0,
      image: img ? { src: img.src, alt: img.alt } : null,
    };
  });
  const giftFaqs = faqGroups.find((g) => g.id === "gifts")?.items ?? [];

  return (
    <>
      <JsonLd
        data={[
          ...products.map((p) => productJsonLd(p, today)),
          faqJsonLd(giftFaqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Subscriptions", path: "/subscriptions" },
          ]),
        ]}
      />

      <section className="container-page grid items-end gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Eyebrow>Flower subscriptions</Eyebrow>
          <h1 className="t-h1 mt-5">
            Give a season <span className="t-accent text-olive">of</span> flowers.
          </h1>
          <p className="t-lead mt-6 max-w-xl">
            A prepaid gift of monthly Garden Bouquets through the 2027 Vermont growing season. You pay once and write a note;
            your recipient collects fresh flowers in Hartland, month after month.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
            {["One payment, no renewals", "Printable gift card", "Pickup in Hartland, VT"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-olive" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative hidden h-[22rem] lg:col-span-5 lg:block">
          {plans.slice(0, 2).map((p, i) =>
            p.image ? (
              <div key={p.id} className={i === 0 ? "absolute bottom-0 left-0 h-[88%] w-[62%]" : "absolute right-0 bottom-0 h-full w-[56%]"}>
                <Image src={p.image.src} alt={p.image.alt} fill priority sizes="300px" className="object-contain object-bottom" />
              </div>
            ) : null,
          )}
          <span className="absolute inset-x-[10%] -bottom-2 h-6 rounded-[50%] bg-[radial-gradient(closest-side,rgba(42,34,29,.16),transparent)] blur-[3px]" />
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <dl className="container-page grid divide-line py-2 sm:grid-cols-3 sm:divide-x">
          {plans.map((p) => (
            <div key={p.id} className="py-6 sm:px-8 first:sm:pl-0">
              <dt className="font-display text-2xl">{p.name}</dt>
              <dd className="mt-1 text-sm text-ink-soft">
                {formatPrice(p.priceCents)} · {p.deliveries} monthly bouquets · {formatPrice(Math.round(p.priceCents / p.deliveries))} per bouquet
              </dd>
            </div>
          ))}
          <div className="py-6 sm:px-8">
            <dt className="font-display text-2xl">Each bouquet</dt>
            <dd className="mt-1 text-sm text-ink-soft">
              A{" "}
              <Link href="/shop/garden-bouquet" className="underline underline-offset-4">
                Garden Bouquet
              </Link>
              , picked for the recipient&apos;s pickup day.
            </dd>
          </div>
        </dl>
      </section>

      <section id="gift" aria-labelledby="builder" className="container-page scroll-mt-28 py-20 sm:py-24">
        <h2 id="builder" className="t-h2 mb-12">
          Build your gift
        </h2>
        <Suspense fallback={<div className="h-[40rem] animate-pulse rounded-sm bg-linen/50" />}>
          <GiftBuilder plans={plans} />
        </Suspense>
      </section>

      <section aria-labelledby="recipient" className="bg-ink text-paper">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow className="text-butter/80">For the recipient</Eyebrow>
            <h2 id="recipient" className="t-h2 mt-5 text-paper">
              Nothing to manage. Just flowers.
            </h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-paper/75">
              Before the season begins, Sarah writes to your recipient with each month&apos;s pickup dates. They choose a
              day, stop by the farm in Hartland, and take home a fresh Garden Bouquet.
            </p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {[
              ["You give the gift", "Choose a plan, write your note and pay once."],
              ["They hear from Sarah", "An email with the season's pickup dates, sent to them or to you to pass on."],
              ["They collect each month", "A Garden Bouquet picked for their pickup day."],
              ["The season ends gently", "No renewals and no surprise charges, ever."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-paper/15 pt-5">
                <p className="text-xs font-semibold text-butter/70 tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-display text-[1.4rem] leading-tight">{t}</p>
                <p className="mt-2 text-sm text-paper/65">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="sub-faq" className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Photo src="/images/photos/wildflowers-blue-bucket.webp" className="aspect-[4/5]" sizes="(max-width: 1024px) 90vw, 40vw" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 id="sub-faq" className="t-h2">
            Questions about gifting
          </h2>
          <div className="mt-8 border-t border-line">
            {giftFaqs.map((f) => (
              <AccordionItem key={f.q} title={f.q}>
                <p>{f.a}</p>
              </AccordionItem>
            ))}
          </div>
          <Link href="/faq" className="link-rule mt-8">
            All questions
          </Link>
        </div>
      </section>
    </>
  );
}
