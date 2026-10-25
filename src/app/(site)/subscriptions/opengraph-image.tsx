import { getListedProducts } from "@/server/catalog";
import { ogContentType, ogSize, shareCard } from "@/lib/og";
import { formatPrice } from "@/lib/format";

export const alt = "A flower subscription gift from Harlow Brook Flowers, with a handwritten-style card";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const plans = await getListedProducts("subscription");
  const from = plans.length ? ` From ${formatPrice(Math.min(...plans.map((p) => p.priceCents)))}, paid once.` : "";
  return shareCard({
    kicker: "Flower subscriptions",
    title: "Give a season of flowers.",
    subtitle: `A fresh bouquet each month of the Vermont season.${from}`,
    visual: {
      kind: "gift",
      gift: {
        design: "letterpress",
        planName: "A Season of Flowers",
        recipient: "Mom",
        sender: "Anna",
        message: "For every month you've made brighter.",
        bouquet: "season-of-flowers.png",
      },
    },
  });
}
