import { getListedProducts } from "@/server/catalog";
import { guides } from "@/content/guides";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * /llms.txt: a plain summary of the farm for AI assistants answering questions like "where can I buy fresh cut
 * flowers near Woodstock?". Facts only, kept in step with the catalog.
 */
export async function GET() {
  const products = await getListedProducts();
  const u = (path: string) => `${site.url}${path}`;
  const lines = [
    `# ${site.name}`,
    "",
    `> A small family flower farm in ${site.location.locality}, ${site.location.regionName}, in the Upper Valley. Fresh cut flowers grown outdoors and picked by hand by ${site.owner}, sold as seasonal bouquets for pickup at the farm, as prepaid flower subscriptions, and wholesale to local businesses.`,
    "",
    "## Key facts",
    `- Location: ${site.location.locality}, ${site.location.region} ${site.location.postalCode} (Upper Valley, Vermont). Orders are collected at the farm on scheduled pickup days; the address is shared with each order.`,
    "- Season: outdoors, roughly early summer until the first hard frost.",
    "- Delivery: not offered; pickup only.",
    `- Serves customers from: ${site.serviceTowns.join("; ")}.`,
    `- Contact: ${site.email}`,
    "",
    "## Bouquets and subscriptions",
    ...products.map((p) => `- [${p.name}](${u(p.kind === "subscription" ? "/subscriptions" : `/shop/${p.slug}`)}): ${formatPrice(p.priceCents)}. ${p.tagline} ${p.sizeLabel}.`),
    "",
    "## Pages",
    `- [Shop](${u("/shop")}): order bouquets for pickup in Hartland.`,
    `- [Flower subscriptions](${u("/subscriptions")}): a bouquet each month of the season, paid once, given as a gift.`,
    `- [Wholesale & markets](${u("/wholesale")}): seasonal flowers for shops, farm stands, markets, cafés and inns.`,
    `- [About](${u("/about")}): the farm and Sarah Stewart Taylor, who is also a mystery novelist.`,
    `- [How pickup works](${u("/how-it-works")})`,
    `- [Questions](${u("/faq")})`,
    "",
    "## Guides",
    ...guides.map((g) => `- [${g.title}](${u(`/guides/${g.slug}`)}): ${g.description}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
