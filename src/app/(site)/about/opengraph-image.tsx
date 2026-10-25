import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Sarah Stewart Taylor, who grows the flowers at Harlow Brook";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "About Harlow Brook",
    title: "Stories at the desk, flowers in the garden.",
    subtitle: "Sarah Stewart Taylor’s family flower farm in Hartland, Vermont.",
    visual: { kind: "photo", photo: "sarah-stewart-taylor.jpg" },
  });
}
