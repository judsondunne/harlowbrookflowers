import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Harlow Brook Flowers: seasonal flowers from a family farm in Hartland, Vermont";
export const size = ogSize;
export const contentType = ogContentType;

/** The default share card for every page that doesn't draw its own. */
export default function Image() {
  return shareCard({ title: "Harlow Brook", visual: { kind: "hero", bouquet: "garden-bouquet.png" } });
}
