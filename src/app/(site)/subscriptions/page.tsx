import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GiftBuilder, type GiftPlan } from "@/components/subscriptions/gift-builder";
import { GiftCardFace } from "@/components/subscriptions/gift-card";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal, RevealGroup, RevealImage, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { faqGroups } from "@/content/faq";
import { primaryImage, productAvailability } from "@/domain/catalog";
import { getListedProducts } from "@/server/catalog";
import { getFarmToday } from "@/server/today";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { formatPrice, numberWord } from "@/lib/format";
import { formatMonth } from "@/lib/time";

export const metadata: Metadata = pageMetadata({
  title: "Flower Subscription in Vermont · A Season of Fresh Flowers",
  absoluteTitle: true,
  description:
    "A flower subscription gift from a Vermont flower farm: a fresh bouquet each month of the growing season, collected in Hartland. Paid once, with a printable card.",
  path: "/subscriptions",
});

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

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
  const fromPrice = plans.length ? Math.min(...plans.map((p) => p.priceCents)) : 0;
  const perBouquet = plans[0] ? Math.round(plans[0].priceCents / plans[0].deliveries) : 0;
  const months = [...new Set(plans.flatMap((p) => p.startMonths))].sort();
  const firstMonth = months[0];
  const seasonYear = firstMonth?.slice(0, 4);

  // Everything a giver needs to know, in plain language. PROVISIONAL wording: Sarah to confirm pickup details.
  const included: [string, React.ReactNode][] = [
    [
      "What they receive",
      <>
        A{" "}
        <Link
          href="/shop/garden-bouquet"
          className="underline decoration-ink/35 underline-offset-4 hover:decoration-ink"
        >
          Garden Bouquet
        </Link>{" "}
        each month: a hand-tied mix of about 20 stems, picked from whatever is blooming that week.
      </>,
    ],
    [
      "How many",
      `${capitalize(plans.map((p) => `${numberWord(p.deliveries)} bouquets (${p.name}, ${formatPrice(p.priceCents)})`).join(" or "))}.` +
        (perBouquet ? ` ${formatPrice(perBouquet)} a bouquet either way.` : ""),
    ],
    [
      "When",
      `Once a month through the ${seasonYear ?? ""} Vermont growing season${firstMonth ? `, starting as early as ${formatMonth(firstMonth)}` : ""}. You choose the first month.`,
    ],
    [
      "Where",
      "Collected at the farm in Hartland, Vermont, on the pickup day that suits them. Flowers are never shipped.",
    ],
    [
      "How you give it",
      "Choose a plan, write your note and pay once. Print the gift card to give in person, or we can email your note to them.",
    ],
    [
      "After you order",
      "Before the season begins, Sarah writes with each month's pickup dates, to them or to you to pass on. Nothing renews, and there's no account to manage.",
    ],
  ];

  return (
    <>
      <JsonLd
        data={[
          ...products.map((p) => productJsonLd(p, today)),
          faqJsonLd(giftFaqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Flower subscriptions", path: "/subscriptions" },
          ]),
        ]}
      />

      <section className="container-page grid gap-14 pt-12 pb-20 sm:pt-16 lg:grid-cols-12 lg:items-center lg:gap-16 lg:pb-28">
        <div className="lg:col-span-5">
          <Eyebrow className="enter-rise">Flower subscriptions</Eyebrow>
          <h1 className="t-h1 enter-rise mt-3" style={d(80)}>
            Give a season of flowers.
          </h1>
          <p className="t-lead enter-rise mt-6 max-w-lg" style={d(180)}>
            A gift that keeps arriving. Each month of the Vermont growing season, the person you love collects a fresh
            bouquet from our garden in Hartland, picked by hand that week.
          </p>
          <p className="enter-rise mt-6 text-[0.9375rem] text-ink-soft" style={d(260)}>
            From <span className="text-ink tabular-nums">{formatPrice(fromPrice)}</span>, paid once and never renewed.
          </p>
          <div className="enter-rise mt-8 flex flex-wrap items-center gap-x-7 gap-y-3" style={d(340)}>
            <ButtonLink href="/subscriptions#gift" size="lg">
              Choose a gift
            </ButtonLink>
            <Link href="#included" className="link-rule">
              What&apos;s included
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          <div className="enter-unveil w-full sm:ml-auto sm:w-[82%]" style={d(150)}>
            <Photo
              src="/images/photos/zinnias-mason-jar.webp"
              priority
              className="aspect-[4/5]"
              sizes="(max-width: 1024px) 90vw, 42vw"
            />
          </div>
          <GiftCardFace
            className="gift-card-tucked relative -mt-24 mr-6 ml-auto w-[86%] max-w-[21rem] sm:absolute sm:bottom-10 sm:left-0 sm:m-0 sm:w-[19rem]"
            planName="A Season of Flowers"
            detail="3 Garden Bouquets"
            recipient="Mom"
            message="“For every month you've made brighter.”"
            sender="Anna"
          />
        </div>
      </section>

      <section id="included" aria-labelledby="included-title" className="scroll-mt-24 border-t border-line bg-paper">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h2 id="included-title" className="t-h2">
              What&apos;s included
            </h2>
            <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-ink-soft">
              Simple to give, nothing for them to manage. Here is exactly how it works.
            </p>
          </Reveal>
          <RevealGroup as="dl" className="lg:col-span-8">
            {included.map(([term, detail]) => (
              <RevealItem
                key={term}
                className="grid gap-1 border-t border-line py-5 last:border-b sm:grid-cols-[11rem_1fr] sm:gap-8"
              >
                <dt className="font-display font-medium text-[1.1875rem] leading-snug">{term}</dt>
                <dd className="text-[0.9688rem] leading-relaxed text-ink-soft">{detail}</dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="gift" aria-labelledby="builder" className="container-page scroll-mt-24 py-20 sm:py-28">
        <Reveal className="mb-12 max-w-2xl">
          <h2 id="builder" className="t-h2">
            Choose your gift
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">
            Pick a plan, tell us who it&apos;s for, and write the note that goes on their card.
          </p>
        </Reveal>
        <Suspense fallback={<div className="h-[40rem] animate-pulse bg-linen/50" />}>
          <GiftBuilder plans={plans} />
        </Suspense>
      </section>

      <section aria-labelledby="sub-faq" className="border-t border-line">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <RevealImage className="lg:col-span-5">
            <Photo
              src="/images/photos/wildflowers-blue-bucket.webp"
              className="aspect-[4/5]"
              sizes="(max-width: 1024px) 90vw, 40vw"
            />
          </RevealImage>
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
            <p className="mt-8 text-[0.9375rem] text-ink-soft">
              Looking for something for this week instead?{" "}
              <Link href="/shop" className="underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
                Choose a single bouquet
              </Link>{" "}
              or read{" "}
              <Link href="/faq" className="underline decoration-ink/35 underline-offset-4 hover:decoration-ink">
                all questions
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
