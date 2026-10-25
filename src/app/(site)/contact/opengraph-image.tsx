import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "Contact Harlow Brook Flowers";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return shareCard({
    kicker: "Contact",
    title: "Write to the farm.",
    subtitle: "Questions about an order, a gift or flowers for something special? Sarah reads every message.",
    visual: { kind: "photo", photo: "farmhouse-pond.jpg" },
  });
}
