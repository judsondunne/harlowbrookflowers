import { getCatalog, getProductBySlug } from "@/server/catalog";
import { cutoutFor, ogContentType, ogSize, shareCard } from "@/lib/og";
import { formatPrice } from "@/lib/format";

export const alt = "A seasonal bouquet from Harlow Brook Flowers";
export const size = ogSize;
export const contentType = ogContentType;

export async function generateStaticParams() {
  const products = await getCatalog();
  return products.filter((p) => p.kind === "bouquet").map((p) => ({ slug: p.slug }));
}

/** One bouquet: its cutout on the butter circle, with its name, price and size. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) return shareCard({ title: "Harlow Brook", visual: { kind: "hero", bouquet: "garden-bouquet.png" } });
  return shareCard({
    kicker: "Seasonal bouquet",
    title: product.name,
    subtitle: `${formatPrice(product.priceCents)} · ${product.sizeLabel}. Picked for your pickup day in Hartland.`,
    visual: { kind: "cutout", bouquet: cutoutFor(product.images.find((i) => i.kind === "cutout")?.src) },
  });
}
