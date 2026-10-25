import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Questions about Harlow Brook Flowers";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "Questions",
    title: "Good questions, honest answers.",
    subtitle: "Pickup, the flowers themselves, gifts and orders.",
    visual: { kind: "cutout", bouquet: "little-posy.png" },
  });
}
