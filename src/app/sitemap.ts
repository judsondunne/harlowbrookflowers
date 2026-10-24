import type { MetadataRoute } from "next";
import { getListedProducts } from "@/server/catalog";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getListedProducts("bouquet");
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/shop", priority: 0.9, changeFrequency: "weekly" },
    { path: "/subscriptions", priority: 0.9, changeFrequency: "monthly" },
    { path: "/wholesale", priority: 0.8, changeFrequency: "monthly" },
    { path: "/gift-flowers", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.1, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.1, changeFrequency: "yearly" },
  ];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p.path === "/" ? "" : p.path}`, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...products.map((p) => ({
      url: `${site.url}/shop/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
