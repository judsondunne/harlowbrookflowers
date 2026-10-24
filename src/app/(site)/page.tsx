import type { Metadata } from "next";
import { Hero, type HeroSlide } from "@/components/home/hero";
import {
  AuthorNote,
  FeatureStrip,
  NewsletterSection,
  PickupSteps,
  SeasonBand,
  ShopSection,
  StorySection,
  SubscriptionBand,
} from "@/components/home/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { homeContent } from "@/content/home";
import { assetSize } from "@/content/asset-manifest";
import { primaryImage, productAvailability } from "@/domain/catalog";
import { getListedProducts } from "@/server/catalog";
import { getSettings } from "@/server/settings";
import { getFarmToday } from "@/server/today";
import { localBusinessJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Harlow Brook Flowers · Locally Grown Flowers in Hartland, Vermont",
  absoluteTitle: true,
  description:
    "Seasonal bouquets grown and hand-picked by Sarah Stewart Taylor in Hartland, Vermont. Order online for local pickup in the Upper Valley, or give a prepaid season of flowers.",
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
      <JsonLd data={localBusinessJsonLd()} />
      <Hero slides={slides} copy={homeContent.hero} />
      <FeatureStrip />
      <ShopSection products={bouquetsBySize} today={today} />
      <StorySection />
      <SubscriptionBand plans={plans} />
      <PickupSteps pickupLocation={settings.pickupLocationPublic} />
      <SeasonBand seasonNote={settings.seasonNote} />
      <AuthorNote />
      <NewsletterSection />
    </>
  );
}
