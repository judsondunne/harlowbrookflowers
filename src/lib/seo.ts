import type { Metadata } from "next";
import type { Product } from "@/domain/catalog";
import { productAvailability } from "@/domain/catalog";
import { site } from "./site";

/** Consistent per-page metadata with canonical URL and Open Graph. */
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
      images: [input.image ?? { url: "/og/harlow-brook.jpg", alt: site.name, width: 1200, height: 630 }],
    },
    robots: input.noindex || !site.indexable ? { index: false, follow: false } : undefined,
  };
}

const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

/** Florist (a LocalBusiness subtype). Locality only: the farm address is a private residence. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": `${site.url}/#business`,
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    image: abs("/og/harlow-brook.jpg"),
    logo: abs("/icon.svg"),
    founder: { "@type": "Person", name: site.owner },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.locality,
      addressRegion: site.location.region,
      postalCode: site.location.postalCode,
      addressCountry: site.location.country,
    },
    areaServed: [
      { "@type": "City", name: "Hartland, Vermont" },
      { "@type": "AdministrativeArea", name: "Upper Valley, Vermont and New Hampshire" },
    ],
    priceRange: "$20–$210",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit card",
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
    image: product.images.map((i) => abs(i.src)),
    brand: { "@type": "Brand", name: site.name },
    url: abs(path),
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
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
