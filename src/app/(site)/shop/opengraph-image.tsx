import { getListedProducts } from "@/server/catalog";
import { cutoutFor, ogContentType, ogSize, shareCard } from "@/lib/og";
import { formatPrice } from "@/lib/format";

export const alt = "Seasonal bouquets from Harlow Brook Flowers, for pickup in Hartland, Vermont";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const bouquets = (await getListedProducts("bouquet")).sort((a, b) => a.priceCents - b.priceCents);
  const from = bouquets[0] ? ` From ${formatPrice(bouquets[0].priceCents)}.` : "";
  return shareCard({
    kicker: "The shop",
    title: "Bouquets for pickup in Hartland",
    subtitle: `Hand-tied from whatever is blooming that week.${from}`,
    visual: { kind: "lineup", bouquets: bouquets.slice(0, 3).map((p) => cutoutFor(p.images.find((i) => i.kind === "cutout")?.src)) },
  });
}
