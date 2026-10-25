import type { MetadataRoute } from "next";
import { getListedProducts } from "@/server/catalog";
import { guides } from "@/content/guides";
import { site } from "@/lib/site";

const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;
const img = (path: string) => `${site.url}${path}`;

/** Every public page, with its main images (for Google Images) and real modification dates where known. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getListedProducts();
  const bouquets = products.filter((p) => p.kind === "bouquet");
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; images?: string[] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly", images: ["/images/bouquets/garden-bouquet.webp"] },
    { path: "/shop", priority: 0.9, changeFrequency: "weekly", images: bouquets.flatMap((p) => p.images.slice(0, 1).map((i) => i.src)) },
    { path: "/subscriptions", priority: 0.9, changeFrequency: "monthly", images: ["/images/photos/zinnias-mason-jar.webp"] },
    { path: "/wholesale", priority: 0.8, changeFrequency: "monthly", images: ["/images/photos/wrapped-bouquets.webp"] },
    { path: "/gift-flowers", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly", images: ["/images/photos/sarah-stewart-taylor.webp"] },
    { path: "/guides", priority: 0.6, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.1, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.1, changeFrequency: "yearly" },
  ];
  return [
    ...pages.map((p) => ({
      url: url(p.path),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
      ...(p.images?.length ? { images: p.images.map(img) } : {}),
    })),
    ...bouquets.map((p) => ({
      url: url(`/shop/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.map((i) => img(i.src)),
    })),
    ...guides.map((g) => ({
      url: url(`/guides/${g.slug}`),
      lastModified: g.modified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: [img(g.image)],
    })),
  ];
}
