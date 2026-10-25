import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Flower guides from Harlow Brook Flowers, a family flower farm in Hartland, Vermont";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "Guides",
    title: "Notes from a Vermont flower farm",
    subtitle: "What blooms when, how to make flowers last, and where to find them close to home.",
    visual: { kind: "photo", photo: "dahlia-harvest-flatlay.jpg" },
  });
}
