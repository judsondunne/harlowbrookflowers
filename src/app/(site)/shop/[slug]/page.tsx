import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ProductGallery } from "@/components/shop/product-gallery";
import { PurchasePanel } from "@/components/shop/purchase-panel";
import { ProductCard } from "@/components/shop/product-card";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/typography";
import { JsonLd } from "@/components/seo/json-ld";
import { getCatalog, getListedProducts, getProductBySlug } from "@/server/catalog";
import { getUpcomingWindows } from "@/server/availability";
import { loadSettings } from "@/server/settings";
import { getFarmToday } from "@/server/today";
import { db } from "@/server/db/client";
import { primaryImage, productAvailability, type Product } from "@/domain/catalog";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/format";
import { formatDateLong } from "@/lib/time";

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.filter((p) => p.kind === "bouquet").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Bouquet not found" };
  const img = primaryImage(product, "photo");
  return pageMetadata({
    title: `${product.name} · ${formatPrice(product.priceCents)} Seasonal Bouquet`,
    description: `${product.summary} Locally grown in Hartland, Vermont, for pickup at the farm.`,
    path: `/shop/${product.slug}`,
    image: img ? { url: img.src, alt: img.alt } : undefined,
  });
}

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, today] = await Promise.all([getProductBySlug(slug), getFarmToday()]);
  if (!product) notFound();
  if (product.kind === "subscription") redirect(`/subscriptions?plan=${product.slug}#gift`);

  const listed = await getListedProducts();
  const others = [
    ...listed.filter((p) => p.kind === "bouquet" && p.id !== product.id),
    ...listed.filter((p) => p.kind === "subscription").slice(0, 1),
  ];
  const paragraphs = product.description.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, today),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.name, path: `/shop/${product.slug}` },
          ]),
        ]}
      />
      <div className="container-page pt-6 pb-20 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.8125rem] text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/shop" className="hover:text-ink">
                Shop
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="lg:col-span-5">
            <Eyebrow>Seasonal bouquet · Hartland, VT</Eyebrow>
            <h1 className="t-h1 mt-4 text-[clamp(2.4rem,4.4vw,3.75rem)]">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-4">
              <p className="text-2xl font-semibold tabular-nums">{formatPrice(product.priceCents)}</p>
              <p className="text-sm text-muted">{product.sizeLabel}</p>
            </div>
            <p className="t-lead mt-5">{product.summary}</p>
            <div className="mt-8 border-t border-line pt-8">
              <Suspense fallback={<PanelSkeleton />}>
                <LivePurchasePanel product={product} today={today} />
              </Suspense>
            </div>

            <div className="mt-10 border-t border-line">
              <AccordionItem title="About this bouquet" defaultOpen>
                <div className="space-y-3">
                  {paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </AccordionItem>
              {product.details.length > 0 && (
                <AccordionItem title="What's included">
                  <ul className="prose-hb">
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {product.care.length > 0 && (
                <AccordionItem title="Caring for your flowers">
                  <ul className="prose-hb">
                    {product.care.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              <AccordionItem title="Pickup & changes">
                <p>
                  Bouquets are collected at the farm in Hartland, Vermont, during the pickup time you choose. The address and
                  directions are in your confirmation email. If plans change, write to us as soon as you can; see the{" "}
                  <Link href="/faq" className="underline underline-offset-4">
                    FAQ
                  </Link>{" "}
                  for changes and cancellations.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="more" className="border-t border-line bg-paper">
        <div className="container-page py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="more" className="t-h2">
              More from the garden
            </h2>
            <ButtonLink href="/subscriptions" variant="secondary" arrow>
              Or give a whole season
            </ButtonLink>
          </div>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} today={today} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

async function LivePurchasePanel({ product, today }: { product: Product; today: string }) {
  await connection();
  const settings = await loadSettings();
  const windows = await getUpcomingWindows(db, { now: new Date(), cutoffHours: settings.orderCutoffHours, limit: 12 });
  const availability = productAvailability(product, today);
  const reason =
    availability.state === "sold_out"
      ? "Sold out for now"
      : availability.state === "out_of_season"
        ? availability.opensOn
          ? `Back in season ${formatDateLong(availability.opensOn)}`
          : "Out of season"
        : !settings.salesOpen
          ? settings.closedMessage
          : undefined;
  const maxQuantity = Math.max(1, Math.min(product.maxPerOrder, availability.state === "available" && availability.remaining !== null ? availability.remaining : product.maxPerOrder));
  return (
    <PurchasePanel
      product={{ id: product.id, name: product.name, priceCents: product.priceCents }}
      windows={windows}
      purchasable={availability.state === "available" && settings.salesOpen}
      unavailableReason={reason}
      maxQuantity={maxQuantity}
    />
  );
}

function ProductSkeleton() {
  return (
    <div className="container-page grid gap-12 pt-16 pb-20 lg:grid-cols-12 lg:gap-16" aria-hidden>
      <div className="aspect-[4/5] bg-paper lg:col-span-7" />
      <div className="space-y-5 lg:col-span-5">
        <div className="h-3 w-40 rounded-full bg-linen" />
        <div className="h-14 w-3/4 rounded bg-linen" />
        <div className="h-6 w-24 rounded bg-linen" />
        <PanelSkeleton />
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-4 w-40 rounded-full bg-linen" />
      <div className="h-16 rounded-sm bg-linen/70" />
      <div className="h-16 rounded-sm bg-linen/70" />
      <div className="h-13 rounded-full bg-linen" />
    </div>
  );
}
