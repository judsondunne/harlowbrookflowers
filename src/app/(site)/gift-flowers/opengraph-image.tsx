import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Flower gifts from Harlow Brook Flowers";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "Gift flowers",
    title: "The kind of gift people remember.",
    subtitle: "Hand-tied bouquets with a handwritten card, or a whole season of them.",
    visual: { kind: "photo", photo: "zinnia-jug.jpg" },
  });
}
