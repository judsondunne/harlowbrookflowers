import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero, type HeroSlide } from "@/components/home/hero";
import { NextPickup } from "@/components/shop/next-pickup";
import {
  AuthorNote,
  NewsletterSection,
  SeasonSection,
  ShopSection,
  StorySection,
  SubscriptionBand,
  WholesaleBand,
} from "@/components/home/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { homeContent } from "@/content/home";
import { assetSize } from "@/content/asset-manifest";
import { primaryImage, productAvailability } from "@/domain/catalog";
import { getListedProducts } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import { getFarmToday } from "@/server/today";
import { localBusinessJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Fresh Cut Flowers in Hartland, Vermont · Harlow Brook Flowers",
  absoluteTitle: true,
  description:
    "Fresh cut flowers grown and hand-picked on a family farm in Hartland, Vermont. Order seasonal bouquets for pickup in the Upper Valley, or give a flower subscription.",
  path: "/",
});

export default async function HomePage() {
  const [products, settings, today] = await Promise.all([getListedProducts(), getSettings(), getFarmToday()]);
  const bouquets = products.filter((p) => p.kind === "bouquet");
  const plans = products.filter((p) => p.kind === "subscription");

  const slides: HeroSlide[] = products.flatMap((p) => {
    const img = primaryImage(p, "cutout");
    if (!img) return [];
    return [
      {
        id: p.id,
        slug: p.slug,
        kind: p.kind,
        name: p.name,
        tagline: p.tagline,
        sizeLabel: p.sizeLabel,
        priceCents: p.priceCents,
        purchasable: productAvailability(p, today).state === "available",
        image: { src: img.src, alt: img.alt, ...assetSize(img.src) },
      },
    ];
  });

  const bouquetsBySize = [...bouquets].sort((a, b) => a.priceCents - b.priceCents);

  return (
    <>
      <JsonLd data={[websiteJsonLd(), localBusinessJsonLd(products)]} />
      <Hero
        slides={slides}
        copy={homeContent.hero}
        pickup={
          <Suspense fallback={null}>
            <NextPickup compact />
          </Suspense>
        }
      />
      <ShopSection products={bouquetsBySize} today={today} />
      <StorySection />
      <SubscriptionBand plans={plans} />
      <SeasonSection seasonNote={settings.seasonNote} />
      <WholesaleBand />
      <AuthorNote />
      <NewsletterSection />
    </>
  );
}
