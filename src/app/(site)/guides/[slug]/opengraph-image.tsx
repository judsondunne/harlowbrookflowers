import { guideBySlug, guides } from "@/content/guides";
import { ogContentType, ogSize, shareCard } from "@/lib/og";

export const alt = "A guide from Harlow Brook Flowers in Hartland, Vermont";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideBySlug((await params).slug);
  if (!guide) return shareCard({ title: "Harlow Brook Flowers", visual: { kind: "hero", bouquet: "garden-bouquet.png" } });
  return shareCard({ kicker: guide.kicker, title: guide.title, subtitle: guide.description.split(":")[0] + ".", visual: { kind: "photo", photo: guide.ogImage } });
}
