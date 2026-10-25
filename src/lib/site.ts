/**
 * Business identity and site-wide configuration.
 * Anything marked PROVISIONAL must be confirmed by Sarah before launch (see docs/LAUNCH_CHECKLIST.md).
 */
// NEXT_PUBLIC_SITE_URL wins; on Vercel the project's production domain is the fallback.
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")).replace(/\/$/, "");

export const site = {
  name: "Harlow Brook Flowers",
  shortName: "Harlow Brook",
  tagline: "Grown slowly. Given joyfully.",
  description:
    "Seasonal cut flowers grown and hand-picked by Sarah Stewart Taylor in Hartland, Vermont. Order a bouquet for local pickup or give a season of flowers.",
  owner: "Sarah Stewart Taylor",
  url: siteUrl,
  // Search engines may index the site only on its real domain: never on localhost or a *.vercel.app preview.
  indexable: !/^(localhost|127\.0\.0\.1)$|\.vercel\.app$/.test(new URL(siteUrl).hostname),
  locale: "en_US",
  timeZone: "America/New_York",
  currency: "usd",
  location: {
    // Public locality only. The farm's street address is never published (private residence).
    locality: "Hartland",
    region: "VT",
    regionName: "Vermont",
    postalCode: "05048",
    country: "US",
    area: "Vermont's Upper Valley",
    // Approximate town-level coordinates for structured data (not the farm itself).
    geo: { latitude: 43.5432, longitude: -72.4007 },
  },
  // PROVISIONAL: placeholder inbox until Sarah confirms the address she wants to publish.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@harlowbrookflowers.com",
  authorSite: "https://www.sarahstewarttaylor.com/",
  /**
   * Official profiles (Google Business Profile, Instagram, Facebook, Apple Maps…). Each one added here appears in
   * the business structured data as `sameAs`, which helps search engines connect the listings to this site.
   */
  social: [] as string[],
  /** Towns customers come from, for structured data and the Upper Valley guide. Pickup is always in Hartland. */
  serviceTowns: [
    "Hartland, VT",
    "Windsor, VT",
    "Woodstock, VT",
    "Quechee, VT",
    "White River Junction, VT",
    "Norwich, VT",
    "Plainfield, NH",
    "Cornish, NH",
    "Lebanon, NH",
    "Hanover, NH",
  ],
  // Small "Sample photo" note on provisional stock photography. Turn off once Sarah's own photos are in.
  labelSamplePhotos: true,
} as const;

export const mainNav = [
  { href: "/shop", label: "Shop" },
  { href: "/subscriptions", label: "Flower Subscriptions" },
  { href: "/wholesale", label: "Wholesale & Markets" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = {
  shop: [
    { href: "/shop", label: "All bouquets" },
    { href: "/subscriptions", label: "Flower subscriptions" },
    { href: "/gift-flowers", label: "Gift flowers" },
    { href: "/cart", label: "Your cart" },
  ],
  farm: [
    { href: "/about", label: "About the farm" },
    { href: "/wholesale", label: "Wholesale & markets" },
    { href: "/how-it-works", label: "How pickup works" },
    { href: "/guides", label: "Flower guides" },
    { href: "/faq", label: "Questions" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/credits", label: "Photo credits" },
  ],
} as const;
