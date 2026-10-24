import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Photo } from "@/components/home/sections";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, SampleTag } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { homeContent } from "@/content/home";
import { asset } from "@/content/asset-manifest";
import { getSettings } from "@/server/settings";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Flower Farm in Hartland, Vermont",
  description:
    "A small family flower farm in Hartland, Vermont, in the Upper Valley. Seasonal cut flowers grown outdoors and picked by hand from early summer to the first frost.",
  path: "/our-farm",
});

export default async function OurFarmPage() {
  const settings = await getSettings();
  const hero = asset("/images/photos/dahlia-rows.webp");
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Our Farm", path: "/our-farm" },
        ])}
      />
      <section className="container-page pt-14 pb-12 sm:pt-20">
        <Eyebrow>Our farm</Eyebrow>
        <h1 className="t-h1 mt-5 max-w-4xl">A cottage garden in Hartland, Vermont.</h1>
        <p className="t-lead mt-6 max-w-2xl">
          Harlow Brook Flowers grows on a family farm in Hartland, a small town on the Connecticut River in Vermont&apos;s Upper
          Valley. Everything is grown outdoors, in season, and picked by hand.
        </p>
      </section>

      <div className="container-page">
        <div className="img-well relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
          <Image src="/images/photos/dahlia-rows.webp" alt={hero?.alt ?? ""} fill priority sizes="100vw" className="object-cover" />
          <SampleTag />
        </div>
      </div>

      <section className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Eyebrow>How we grow</Eyebrow>
          <h2 className="t-h2 mt-5">Small on purpose.</h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8">
          {[
            ["Grown outdoors", "The flowers grow in the open garden, with the Vermont weather, so the season sets the pace."],
            ["Picked by hand", "Sarah cuts the stems herself for each pickup day, choosing what is at its best that week."],
            ["Never shipped", "Bouquets go straight from the garden to you, collected at the farm rather than boxed and trucked."],
            ["Limited by design", "Each pickup day has a set number of bouquets. When they're gone, they're gone until the next."],
          ].map(([t, d]) => (
            <div key={t} className="border-t border-line pt-5">
              <h3 className="t-h3">{t}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page grid grid-cols-12 gap-4 pb-20 sm:gap-6">
        <Photo src="/images/photos/dahlia-basket.webp" className="col-span-7 aspect-[4/5]" sizes="55vw" />
        <div className="col-span-5 flex flex-col gap-4 sm:gap-6">
          <Photo src="/images/photos/zinnias-in-hand.webp" sample={false} className="aspect-square" sizes="40vw" />
          <Photo src="/images/photos/buckets-of-flowers.webp" sample={false} className="aspect-[4/3]" sizes="40vw" />
        </div>
      </section>

      <section className="bg-butter">
        <div className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>The season</Eyebrow>
            <h2 className="t-h2 mt-5">Early summer to the first hard frost.</h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">{settings.seasonNote}</p>
          </div>
          <dl className="lg:col-span-6 lg:col-start-7">
            {homeContent.season.months.map((m) => (
              <div key={m.label} className="grid gap-1 border-t border-ink/15 py-5 last:border-b sm:grid-cols-[10rem_1fr]">
                <dt className="font-display text-xl">{m.label}</dt>
                <dd className="text-ink-soft">{m.flowers}</dd>
              </div>
            ))}
            <p className="mt-4 text-xs text-muted">A typical Vermont season; every year is a little different.</p>
          </dl>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <Photo src="/images/photos/mountain-valley.webp" className="aspect-[4/3]" sizes="(max-width:1024px) 90vw, 45vw" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Eyebrow>Visiting</Eyebrow>
          <h2 className="t-h2 mt-5">Come by on a pickup day.</h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
            The farm is a family home, so it isn&apos;t open for drop-in visits. Instead, every order comes with a pickup time:
            stop by, give your name, and take your flowers home. Directions arrive with your confirmation.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/shop" arrow>
              Order for pickup
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">
              How pickup works
            </ButtonLink>
          </div>
          <p className="mt-8 text-sm text-muted">
            Serving neighbors across the Upper Valley, including Windsor, Woodstock, Quechee, White River Junction and Hanover,
            with pickup in Hartland. <Link href="/faq" className="underline underline-offset-4">Delivery questions?</Link>
          </p>
        </div>
      </section>
    </>
  );
}
