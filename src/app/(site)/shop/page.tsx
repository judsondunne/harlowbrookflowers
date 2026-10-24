import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { NextPickup, NextPickupFallback } from "@/components/shop/next-pickup";
import { PageIntro, Eyebrow } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { getListedProducts } from "@/server/catalog";
import { getFarmToday } from "@/server/today";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop Fresh Flower Bouquets · Pickup in Hartland, VT",
  description:
    "Order seasonal, locally grown bouquets from Harlow Brook Flowers for pickup in Hartland, Vermont. Three sizes from $20, plus prepaid flower subscriptions to give as gifts.",
  path: "/shop",
});

export default async function ShopPage() {
  const [products, today] = await Promise.all([getListedProducts(), getFarmToday()]);
  const bouquets = products.filter((p) => p.kind === "bouquet").sort((a, b) => a.priceCents - b.priceCents);
  const plans = products.filter((p) => p.kind === "subscription");

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }])} />
      <PageIntro eyebrow="The shop" title="Bouquets for pickup in Hartland">
        <p>
          Every bouquet is hand-tied from whatever is blooming that week, so no two are quite the same. Choose a size,
          pick a pickup day, and collect your flowers at the farm.
        </p>
        <div className="mt-6">
          <Suspense fallback={<NextPickupFallback />}>
            <NextPickup />
          </Suspense>
        </div>
      </PageIntro>

      <section aria-labelledby="bouquets" className="container-page pb-24">
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-line pb-4">
          <h2 id="bouquets" className="t-h3">
            Bouquets
          </h2>
          <p className="text-sm text-muted">{bouquets.length} sizes</p>
        </div>
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {bouquets.map((p, i) => (
            <ProductCard key={p.id} product={p} today={today} priority={i < 3} />
          ))}
        </div>
      </section>

      {plans.length > 0 && (
        <section aria-labelledby="plans" className="bg-paper">
          <div className="container-page py-20">
            <div className="mb-10 grid gap-6 border-b border-line pb-6 lg:grid-cols-2 lg:items-end">
              <div>
                <Eyebrow>Gift subscriptions</Eyebrow>
                <h2 id="plans" className="t-h2 mt-4">
                  A season of flowers, given once.
                </h2>
              </div>
              <p className="text-[0.9375rem] leading-relaxed text-ink-soft lg:justify-self-end lg:max-w-md">
                Prepaid monthly Garden Bouquets for someone you love, collected in Hartland through the growing season.{" "}
                <Link href="/subscriptions" className="font-semibold text-ink underline underline-offset-4">
                  How subscriptions work
                </Link>
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((p) => (
                <ProductCard key={p.id} product={p} today={today} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted">
          Photos are sample photography that shows the style and size of each bouquet. Yours will be made from what&apos;s
          in bloom that week, with the same care and generosity. Questions?{" "}
          <Link href="/faq" className="font-semibold text-ink underline underline-offset-4">
            Read the FAQ
          </Link>
          .
        </p>
      </section>
    </>
  );
}
