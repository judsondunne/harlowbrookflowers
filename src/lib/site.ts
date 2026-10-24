/**
 * Business identity and site-wide configuration.
 * Anything marked PROVISIONAL must be confirmed by Sarah before launch (see docs/LAUNCH_CHECKLIST.md).
 */
export const site = {
  name: "Harlow Brook Flowers",
  shortName: "Harlow Brook",
  tagline: "Grown slowly. Given joyfully.",
  description:
    "Seasonal cut flowers grown and hand-picked by Sarah Stewart Taylor in Hartland, Vermont. Order a bouquet for local pickup or give a season of flowers.",
  owner: "Sarah Stewart Taylor",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
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
} as const;

export const mainNav = [
  { href: "/shop", label: "Shop" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/gift-flowers", label: "Gifts" },
  { href: "/our-farm", label: "Our Farm" },
  { href: "/about", label: "About" },
] as const;

export const footerNav = {
  shop: [
    { href: "/shop", label: "All bouquets" },
    { href: "/subscriptions", label: "Flower subscriptions" },
    { href: "/gift-flowers", label: "Gift flowers" },
    { href: "/cart", label: "Your cart" },
  ],
  farm: [
    { href: "/about", label: "About Sarah" },
    { href: "/our-farm", label: "Our farm" },
    { href: "/how-it-works", label: "How pickup works" },
    { href: "/faq", label: "Questions" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/credits", label: "Photo credits" },
  ],
} as const;
