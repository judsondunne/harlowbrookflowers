/**
 * DEMO catalog. Every product, price, size, image and date here is PROVISIONAL until Sarah approves it.
 * Edit live data in /admin; this file only seeds a fresh database.
 */
import type { Product } from "@/domain/catalog";

type SeedProduct = Omit<Product, "updatedAt">;

const bouquetCare = [
  "Trim the stems at an angle as soon as you get home.",
  "Use a clean vase with cool water, and change the water every day or two.",
  "Keep the bouquet out of direct sun and away from heat and ripening fruit.",
];

const subscriptionCare = [
  "Each bouquet comes with the same care notes as our single bouquets.",
  "Recipients collect in Hartland; Sarah confirms each month's pickup dates by email.",
];

export const seedProducts: SeedProduct[] = [
  {
    id: "prod_little_posy",
    slug: "little-posy",
    kind: "bouquet",
    status: "active",
    name: "The Little Posy",
    tagline: "A small hand-tied bunch for a windowsill or bedside.",
    summary:
      "A handful of whatever is blooming that week, tied with twine. Right for a kitchen windowsill, a bedside table, or a thank-you.",
    description:
      "The Little Posy is our smallest bouquet: a hand-tied bunch of the season's flowers, picked from the garden for your pickup day.\n\nIt is sized for small spaces and small gestures: a bud vase, a jam jar, a desk. No two are alike, because the garden changes from one week to the next.",
    priceCents: 2000,
    sizeLabel: "Small · about 10 stems",
    displayScale: 0.72,
    details: [
      "Hand-tied and wrapped in paper",
      "A mix of what is in bloom that week",
      "Sized for a bud vase or small jar",
    ],
    care: bouquetCare,
    images: [
      {
        src: "/images/bouquets/little-posy.webp",
        alt: "A small wrapped bouquet with lavender scabiosa, cream roses, deep red blooms and silvery dusty miller",
        kind: "cutout",
        provisional: true,
      },
      {
        src: "/images/photos/little-posy-styled.webp",
        alt: "A small wrapped bouquet of roses, scabiosa and dusty miller against a pale grey wall",
        kind: "photo",
        provisional: true,
      },
      {
        src: "/images/photos/windowsill-flowers.webp",
        alt: "A glass of orange and yellow flowers on a sunny farmhouse windowsill",
        kind: "photo",
        provisional: true,
      },
    ],
    inventory: null,
    maxPerOrder: 6,
    deliveries: null,
    startMonths: [],
    availableFrom: null,
    availableUntil: null,
    featured: true,
    sortOrder: 30,
  },
  {
    id: "prod_garden_bouquet",
    slug: "garden-bouquet",
    kind: "bouquet",
    status: "active",
    name: "The Garden Bouquet",
    tagline: "A fuller, naturally arranged mix of the season.",
    summary:
      "Our everyday bouquet: a generous, loosely gathered mix of seasonal flowers and foliage that looks like it came straight from the garden, because it did.",
    description:
      "The Garden Bouquet is the one we would bring to a friend's table. It is fuller than the Posy, with focal flowers, airy fillers and garden greenery gathered into a loose, natural shape.\n\nColors and varieties follow the season, so a June bouquet looks quite different from a September one. If you have a color preference, leave a note at checkout and Sarah will do her best to honor it.",
    priceCents: 3500,
    sizeLabel: "Medium · about 20 stems",
    displayScale: 0.86,
    details: [
      "Hand-tied and wrapped in paper",
      "Seasonal focal flowers, fillers and foliage",
      "Fits a medium vase",
      "Vase shown for styling only; not included",
    ],
    care: bouquetCare,
    images: [
      {
        src: "/images/bouquets/garden-bouquet.webp",
        alt: "A loose bouquet of peach garden roses, coral carnations and pink waxflower in a clear glass vase",
        kind: "cutout",
        provisional: true,
      },
      {
        src: "/images/photos/garden-bouquet-styled.webp",
        alt: "Peach garden roses and waxflower arranged in a clear glass vase against a pale wall",
        kind: "photo",
        provisional: true,
      },
      {
        src: "/images/photos/breakfast-table-flowers.webp",
        alt: "A vase of garden flowers on a breakfast table by a window",
        kind: "photo",
        provisional: true,
      },
    ],
    inventory: null,
    maxPerOrder: 6,
    deliveries: null,
    startMonths: [],
    availableFrom: null,
    availableUntil: null,
    featured: true,
    sortOrder: 10,
  },
  {
    id: "prod_harlow_brook_bunch",
    slug: "harlow-brook-bunch",
    kind: "bouquet",
    status: "active",
    name: "The Harlow Brook Bunch",
    tagline: "Our most generous bouquet, for the occasions that deserve it.",
    summary:
      "An abundant armful of the garden's best stems, for birthdays, anniversaries, dinner parties and anyone who deserves something extravagant.",
    description:
      "The Harlow Brook Bunch is the largest bouquet we make, built around the standout flowers of the week with plenty of texture and greenery.\n\nChoose it for a birthday, an anniversary, a host gift, or an \"I'm thinking of you\" that you want to land. Add a handwritten card at no charge.",
    priceCents: 5000,
    sizeLabel: "Large · about 30 stems or more",
    displayScale: 1,
    details: [
      "Large, abundant hand-tied bouquet",
      "Built around the week's standout blooms",
      "Fits a large vase or pitcher",
      "Vase shown for styling only; not included",
    ],
    care: bouquetCare,
    images: [
      {
        src: "/images/bouquets/harlow-brook-bunch.webp",
        alt: "An abundant arrangement of sunflowers, peach roses, blush hydrangea, delphinium and white stock",
        kind: "cutout",
        provisional: true,
      },
      {
        src: "/images/photos/harlow-brook-bunch-styled.webp",
        alt: "A large arrangement of sunflowers, roses, hydrangea and delphinium on a warm beige backdrop",
        kind: "photo",
        provisional: true,
      },
      {
        src: "/images/photos/bouquets-outdoor-table.webp",
        alt: "Several bright garden bouquets in jars on an outdoor table",
        kind: "photo",
        provisional: true,
      },
    ],
    inventory: null,
    maxPerOrder: 4,
    deliveries: null,
    startMonths: [],
    availableFrom: null,
    availableUntil: null,
    featured: true,
    sortOrder: 20,
  },
  {
    id: "prod_season_of_flowers",
    slug: "season-of-flowers",
    kind: "subscription",
    status: "active",
    name: "A Season of Flowers",
    tagline: "Three monthly bouquets. One gift, all season long.",
    summary:
      "Three Garden Bouquets, one each month of the 2027 growing season. Paid for once, sent with your note, and nothing for the recipient to manage.",
    description:
      "A Season of Flowers is a gift that keeps arriving. Choose a starting month, write a note, and pay once. Your recipient collects a Garden Bouquet in Hartland each month for three months.\n\nSarah will be in touch by email with each month's pickup dates so your recipient can choose the one that suits them. Every bouquet follows the growing season, so each one will be different from the last.",
    priceCents: 10500,
    sizeLabel: "3 Garden Bouquets · monthly",
    displayScale: 0.92,
    details: [
      "Three Garden Bouquets, one per month",
      "Starts June, July or August 2027",
      "One payment, no renewals",
      "Includes your gift note",
      "Local pickup in Hartland, Vermont",
    ],
    care: subscriptionCare,
    images: [
      {
        src: "/images/bouquets/season-of-flowers.webp",
        alt: "An airy cottage bouquet of lilac snapdragons, scabiosa, chamomile and pink astilbe",
        kind: "cutout",
        provisional: true,
      },
      {
        src: "/images/photos/season-of-flowers-styled.webp",
        alt: "A soft cottage-garden bouquet of snapdragons, scabiosa and chamomile on a white background",
        kind: "photo",
        provisional: true,
      },
      {
        src: "/images/photos/wildflowers-blue-bucket.webp",
        alt: "A blue enamel bucket of Queen Anne's lace, cornflowers and garden stems on a wooden table",
        kind: "photo",
        provisional: true,
      },
    ],
    inventory: 40,
    maxPerOrder: 1,
    deliveries: 3,
    startMonths: ["2027-06", "2027-07", "2027-08"],
    availableFrom: null,
    availableUntil: null,
    featured: true,
    sortOrder: 40,
  },
  {
    id: "prod_six_months",
    slug: "six-months-of-flowers",
    kind: "subscription",
    status: "active",
    name: "Six Months of Flowers",
    tagline: "Six monthly bouquets across the whole growing season.",
    summary:
      "Six Garden Bouquets, one a month from May through October 2027: a Vermont season from its first blooms to its last.",
    description:
      "Six Months of Flowers follows a Vermont growing season from beginning to end. Your recipient collects one Garden Bouquet each month, May through October.\n\nThe earliest and latest bouquets depend on the weather. Spring can come late and frost can come early in the Upper Valley, so those bouquets will reflect what the season allows. If a month cannot be picked at all, Sarah will arrange a make-up bouquet later in the season.",
    priceCents: 21000,
    sizeLabel: "6 Garden Bouquets · monthly",
    displayScale: 0.95,
    details: [
      "Six Garden Bouquets, one per month",
      "May through October 2027",
      "One payment, no renewals",
      "Includes your gift note",
      "Local pickup in Hartland, Vermont",
    ],
    care: subscriptionCare,
    images: [
      {
        src: "/images/bouquets/six-months-of-flowers.webp",
        alt: "A cheerful jar of garden flowers: tulips, celosia, waxflower, gerbera and orange roses",
        kind: "cutout",
        provisional: true,
      },
      {
        src: "/images/photos/six-months-of-flowers-styled.webp",
        alt: "A glass jar of mixed garden flowers on a grey floor against a white wall",
        kind: "photo",
        provisional: true,
      },
      {
        src: "/images/photos/buckets-of-flowers.webp",
        alt: "Buckets of freshly cut zinnias, cosmos and celosia",
        kind: "photo",
        provisional: true,
      },
    ],
    inventory: 25,
    maxPerOrder: 1,
    deliveries: 6,
    startMonths: ["2027-05"],
    availableFrom: null,
    availableUntil: null,
    featured: true,
    sortOrder: 50,
  },
  {
    id: "prod_dahlia_armful",
    slug: "dahlia-armful",
    kind: "bouquet",
    status: "draft",
    name: "Dahlia Armful (draft)",
    tagline: "Example draft product: not visible on the site.",
    summary: "A draft shows how a future product can be prepared in the admin before it is published.",
    description: "Drafts are never shown to customers. Publish when the product, price and photos are ready.",
    priceCents: 4500,
    sizeLabel: "Large",
    displayScale: 0.9,
    details: [],
    care: bouquetCare,
    images: [
      {
        src: "/images/photos/dahlias-white-bucket.webp",
        alt: "A white bucket of peach and pink dahlias in a green field",
        kind: "photo",
        provisional: true,
      },
    ],
    inventory: 0,
    maxPerOrder: 2,
    deliveries: null,
    startMonths: [],
    availableFrom: "2027-08-01",
    availableUntil: "2027-09-30",
    featured: false,
    sortOrder: 60,
  },
];

/** Rolling DEMO pickup windows so the full flow can be tested. Replace with Sarah's real calendar in /admin/pickups. */
export function demoPickupWindows(from: Date, weeks = 5) {
  const windows: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    label: string;
    capacity: number;
  }[] = [];
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  for (let i = 1; i <= weeks * 7; i++) {
    const day = new Date(d.getTime() + i * 86400000);
    const iso = day.toISOString().slice(0, 10);
    const dow = day.getUTCDay();
    if (dow === 3) {
      windows.push({ id: `pw_${iso}_pm`, date: iso, startTime: "16:00", endTime: "18:30", label: "Wednesday evening pickup", capacity: 12 });
    }
    if (dow === 6) {
      windows.push({ id: `pw_${iso}_am`, date: iso, startTime: "09:00", endTime: "12:00", label: "Saturday morning pickup", capacity: 24 });
    }
  }
  return windows;
}
