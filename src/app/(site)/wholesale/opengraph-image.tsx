import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Wholesale flowers from Harlow Brook Flowers in Hartland, Vermont";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "Wholesale & markets",
    title: "Fresh from our farm. Beautiful in your shop.",
    subtitle: "Seasonal Vermont flowers for shops, farm stands, markets and cafés.",
    visual: { kind: "photo", photo: "wrapped-bouquets.jpg" },
  });
}
