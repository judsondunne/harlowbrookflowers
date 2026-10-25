import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "How ordering and pickup work at Harlow Brook Flowers";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "How it works",
    title: "Ordered ahead. Picked for you. Collected at the farm.",
    subtitle: "Choose a bouquet and a pickup day, then collect your flowers in Hartland.",
    visual: { kind: "photo", photo: "zinnias-in-hand.jpg" },
  });
}
