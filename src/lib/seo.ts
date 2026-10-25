import type { Metadata } from "next";
import type { Product } from "@/domain/catalog";
import { productAvailability } from "@/domain/catalog";
import { site } from "./site";

/** Routes that draw their own link-preview card (an opengraph-image.tsx beside the page). */
const SHARE_CARD_PATHS = ["/shop", "/subscriptions", "/wholesale", "/about", "/gift-flowers", "/how-it-works", "/faq", "/contact", "/guides"];
const hasOwnShareCard = (path: string) => SHARE_CARD_PATHS.includes(path) || /^\/(shop|guides)\/[^/]+$/.test(path);

/**
 * Consistent per-page metadata with canonical URL and Open Graph. The share image comes from the nearest
 * opengraph-image.tsx (each main page draws its own; the homepage card is the default).
 */
export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string };
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const url = `${site.url}${input.path === "/" ? "" : input.path}` || site.url;
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: site.name,
      type: "website",
      locale: site.locale,
      // Pages with their own opengraph-image.tsx must leave `images` unset, or it would replace their card.
      ...(input.image
        ? { images: [input.image] }
        : hasOwnShareCard(input.path)
          ? {}
          : { images: [{ url: "/opengraph-image", alt: site.name, width: 1200, height: 630 }] }),
    },
    robots: input.noindex || !site.indexable ? { index: false, follow: false } : undefined,
  };
}

const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

/** The site itself, so search engines show "Harlow Brook Flowers" as the site name. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    inLanguage: "en-US",
    publisher: { "@id": `${site.url}/#business` },
  };
}

/**
 * The business: a Florist (a LocalBusiness type) that grows its own flowers. Locality and town-level coordinates
 * only, because the farm is a private home. Pass the listed products to describe what it sells.
 */
export function localBusinessJsonLd(products: Product[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": `${site.url}/#business`,
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    slogan: site.tagline,
    url: site.url,
    email: site.email,
    image: [abs("/opengraph-image"), abs("/images/photos/sarah-stewart-taylor.webp")],
    logo: abs("/logo.png"),
    founder: { "@type": "Person", name: site.owner, url: site.authorSite, sameAs: [site.authorSite] },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.locality,
      addressRegion: site.location.region,
      postalCode: site.location.postalCode,
      addressCountry: site.location.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.location.geo.latitude, longitude: site.location.geo.longitude },
    areaServed: [
      ...site.serviceTowns.map((town) => ({ "@type": "City", name: town })),
      { "@type": "AdministrativeArea", name: "Upper Valley, Vermont and New Hampshire" },
    ],
    knowsAbout: ["Fresh cut flowers", "Locally grown flowers", "Seasonal bouquets", "Dahlias", "Zinnias", "Flower subscriptions", "Wholesale cut flowers"],
    ...(products.length
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Fresh cut flowers from Harlow Brook",
            itemListElement: products.map((p) => ({
              "@type": "Offer",
              price: (p.priceCents / 100).toFixed(2),
              priceCurrency: "USD",
              itemOffered: { "@type": "Product", name: p.name, url: abs(p.kind === "subscription" ? "/subscriptions" : `/shop/${p.slug}`) },
            })),
          },
        }
      : {}),
    potentialAction: { "@type": "OrderAction", target: abs("/shop"), deliveryMethod: "https://schema.org/OnSitePickup" },
    priceRange: "$20–$210",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit card",
    ...(site.social.length ? { sameAs: site.social } : {}),
  };
}

/** A guide article, published by the farm. */
export function articleJsonLd(a: { title: string; description: string; path: string; image: string; published: string; modified: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: [abs(a.image)],
    datePublished: a.published,
    dateModified: a.modified,
    mainEntityOfPage: abs(a.path),
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@id": `${site.url}/#business` },
  };
}

export function productJsonLd(product: Product, today: string) {
  const a = productAvailability(product, today);
  const availability =
    a.state === "available"
      ? "https://schema.org/InStock"
      : a.state === "sold_out"
        ? "https://schema.org/SoldOut"
        : a.state === "out_of_season"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/Discontinued";
  const path = product.kind === "subscription" ? `/subscriptions#${product.slug}` : `/shop/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    sku: product.slug,
    category: "Fresh cut flowers",
    image: product.images.map((i) => abs(i.src)),
    brand: { "@type": "Brand", name: site.name },
    url: abs(path),
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      itemCondition: "https://schema.org/NewCondition",
      availability,
      url: abs(path),
      seller: { "@id": `${site.url}/#business` },
      shippingDetails: undefined,
      hasMerchantReturnPolicy: undefined,
      availableDeliveryMethod: "https://schema.org/OnSitePickup",
    },
  };
}

/** Wholesale supply as a Service offered by the farm. No prices or delivery terms until Sarah sets them. */
export function wholesaleServiceJsonLd(offerings: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/wholesale#service`,
    name: "Wholesale cut flowers from Harlow Brook Flowers",
    serviceType: "Wholesale locally grown cut flowers",
    description:
      "Seasonal, hand-grown cut flowers from a family farm in Hartland, Vermont, for shops, farm stands, farmers markets, cafés and other local businesses. Collected at the farm.",
    url: abs("/wholesale"),
    provider: { "@id": `${site.url}/#business` },
    areaServed: [
      { "@type": "City", name: "Hartland, Vermont" },
      { "@type": "AdministrativeArea", name: "Upper Valley, Vermont and New Hampshire" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Wholesale flowers",
      itemListElement: offerings.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
