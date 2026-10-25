/**
 * Guides: original, practical articles that answer what people search for around fresh, local flowers.
 * General horticultural guidance and the typical Vermont season; nothing here speaks for Sarah personally.
 * PROVISIONAL: season timings and drive times are approximate; Sarah to review.
 */
export type GuideBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption: string; rows: [string, string][] }
  | { type: "links"; items: { href: string; label: string; text: string }[] };

export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  kicker: string;
  intro: string;
  image: string;
  /** The share-card copy of the image, in src/assets/og/images. */
  ogImage: string;
  published: string;
  modified: string;
  blocks: GuideBlock[];
};

export const guides: Guide[] = [
  {
    slug: "vermont-flower-season",
    title: "When are flowers in season in Vermont?",
    metaTitle: "Vermont Flower Season: What Blooms When, Month by Month",
    description:
      "A month-by-month guide to Vermont's cut flower season, from the first peonies to the last dahlias before frost, from a flower farm in Hartland.",
    kicker: "The season",
    intro:
      "Vermont's outdoor flower season is short and generous. In the Upper Valley it runs from late spring to the first hard frost, roughly five months, and what's in a bouquet changes every few weeks. Here is what to expect, month by month.",
    image: "/images/photos/dahlia-harvest-flatlay.webp",
    ogImage: "dahlia-harvest-flatlay.jpg",
    published: "2026-10-25",
    modified: "2026-10-25",
    blocks: [
      { type: "h2", text: "Why the season is short" },
      {
        type: "p",
        text: "Hartland sits in the Connecticut River valley, where the last spring frost usually comes in the second half of May and the first autumn frost in late September or early October. Flowers grown outdoors, without heated greenhouses, have to fit into that window. Some, like sweet peas and snapdragons, love the cool start of summer; others, like zinnias and dahlias, need the heat of July and August.",
      },
      { type: "h2", text: "Month by month" },
      {
        type: "table",
        caption: "A typical Vermont cut flower season. Every year, and every garden, is a little different.",
        rows: [
          ["May", "Tulips, daffodils, lilac and the first perennials. Early, and very weather-dependent."],
          ["June", "Peonies, sweet peas, foxglove, lupine, early roses and bachelor's buttons."],
          ["July", "Snapdragons, zinnias, cosmos, scabiosa, sunflowers, larkspur and yarrow."],
          ["August", "High summer: zinnias, dahlias, rudbeckia, celosia, sunflowers and amaranth."],
          ["September", "Dahlias at their best, asters, late cosmos, grasses and seed heads."],
          ["October", "The last dahlias until the first hard frost, then dried flowers and branches."],
        ],
      },
      { type: "h2", text: "What this means for your bouquet" },
      {
        type: "p",
        text: "A bouquet from a Vermont flower farm is a snapshot of one week in one garden. A June bouquet and a September bouquet can look like they came from different places, and that's the point: you get what's at its best right now, picked for the day you collect it.",
      },
      {
        type: "p",
        text: "If you have a favorite flower, the season tells you when to look for it: peonies in June, zinnias through high summer, dahlias from August until frost.",
      },
      { type: "h2", text: "Why local flowers look different from supermarket flowers" },
      {
        type: "p",
        text: "Most cut flowers sold in the United States are imported, many from South America, and spend days in refrigerated trucks and planes on the way. Growers for that market favor varieties that travel well. A local farm can grow delicate garden flowers, such as cosmos, scabiosa and dahlias, that rarely survive that journey, and pick them days rather than weeks before they reach your table.",
      },
      { type: "h2", text: "When to order" },
      {
        type: "p",
        text: "Harlow Brook posts pickup days through the season, each with a limited number of bouquets, so ordering a few days ahead is the surest way to get the size you want. Or give a flower subscription, and someone you love collects a fresh bouquet each month of the season.",
      },
      {
        type: "links",
        items: [
          { href: "/shop", label: "Shop bouquets", text: "Three sizes, picked for your pickup day." },
          { href: "/subscriptions", label: "Give a season of flowers", text: "A bouquet each month, paid once." },
        ],
      },
    ],
  },
  {
    slug: "how-to-keep-cut-flowers-fresh",
    title: "How to keep cut flowers fresh for longer",
    metaTitle: "How to Keep Cut Flowers Fresh Longer: Tips from a Flower Farm",
    description:
      "Simple, practical ways to make fresh cut flowers last: trimming stems, clean water, where to put the vase, and how to look after dahlias, zinnias and sunflowers.",
    kicker: "Flower care",
    intro:
      "Garden flowers are picked close to the day you receive them, so they start their vase life fresh. A few small habits help them last as long as they can.",
    image: "/images/photos/zinnias-mason-jar.webp",
    ogImage: "zinnias-mason-jar.jpg",
    published: "2026-10-25",
    modified: "2026-10-25",
    blocks: [
      { type: "h2", text: "As soon as you get home" },
      {
        type: "list",
        items: [
          "Fill a clean vase with cool water. If the vase has been sitting, wash it with a little soapy water first: bacteria shorten vase life more than anything else.",
          "Trim each stem by about an inch, at an angle, with sharp scissors or a knife, and put it straight into the water.",
          "Strip any leaves that would sit below the waterline. Leaves in water rot quickly and cloud it.",
          "If your flowers came with flower food, add it. If not, clean water changed often works well.",
        ],
      },
      { type: "h2", text: "Every day or two" },
      {
        type: "list",
        items: [
          "Top up or change the water. Garden flowers can be thirsty, especially sunflowers and hydrangea.",
          "Every couple of days, trim the stems again and rinse the vase.",
          "Take out any flowers that have faded, so the rest of the bouquet stays fresh.",
        ],
      },
      { type: "h2", text: "Where to put the vase" },
      {
        type: "p",
        text: "Somewhere cool, out of direct sun and away from radiators, heating vents and drafts. Keep flowers away from ripening fruit, too: fruit gives off ethylene, a gas that makes many flowers age faster. Moving the vase to a cool room overnight helps.",
      },
      { type: "h2", text: "Notes on particular flowers" },
      {
        type: "list",
        items: [
          "Dahlias are glorious but short-lived in a vase, usually three to five days. Enjoy them at their peak.",
          "Zinnias like very clean water. Change it often and they'll reward you.",
          "Sunflowers drink a lot. Check the water every day.",
          "Peonies open from bud. A cool room slows them down; a warm one coaxes them open.",
          "Sweet peas are fragrant and fleeting, at their best for a few days.",
        ],
      },
      { type: "h2", text: "How long will they last?" },
      {
        type: "p",
        text: "It depends on the flowers and the week. With good care, many garden flowers last about a week. Some, like dahlias and sweet peas, are shorter-lived and worth enjoying at their peak; others, like zinnias and snapdragons, often go longer.",
      },
      {
        type: "links",
        items: [
          { href: "/shop", label: "Shop bouquets", text: "Fresh from the garden, for pickup in Hartland." },
          { href: "/guides/vermont-flower-season", label: "The Vermont flower season", text: "What blooms when, month by month." },
        ],
      },
    ],
  },
  {
    slug: "fresh-cut-flowers-upper-valley",
    title: "Fresh cut flowers in the Upper Valley",
    metaTitle: "Fresh Cut Flowers Near Woodstock, Hanover & the Upper Valley",
    description:
      "Where to get fresh, locally grown cut flowers in Vermont's Upper Valley: bouquets from Harlow Brook Flowers in Hartland, for pickup near Woodstock, Windsor, White River Junction and Hanover.",
    kicker: "Local flowers",
    intro:
      "Harlow Brook Flowers grows cut flowers on a family farm in Hartland, Vermont, in the middle of the Upper Valley. If you're looking for fresh flowers near Woodstock, Windsor, Quechee, White River Junction, Norwich, Lebanon or Hanover, this is how to get them.",
    image: "/images/photos/valley-village.webp",
    ogImage: "valley-village.jpg",
    published: "2026-10-25",
    modified: "2026-10-25",
    blocks: [
      { type: "h2", text: "Where the farm is" },
      {
        type: "p",
        text: "Hartland sits on the Connecticut River between Windsor and White River Junction, just off Interstate 91. The farm is a family home, so it isn't open for drop-in visits: every order comes with a pickup time, and the exact address and directions arrive with your confirmation.",
      },
      { type: "h2", text: "How far is it?" },
      {
        type: "table",
        caption: "Approximate driving times to Hartland. They vary with where you start and the season.",
        rows: [
          ["Windsor, VT", "About 15 minutes"],
          ["White River Junction, VT", "About 15 minutes"],
          ["Quechee, VT", "About 15 to 20 minutes"],
          ["Norwich, VT", "About 20 minutes"],
          ["Lebanon, NH", "About 20 minutes"],
          ["Woodstock, VT", "About 20 to 25 minutes"],
          ["Hanover, NH", "About 25 minutes"],
        ],
      },
      { type: "h2", text: "What you can order" },
      {
        type: "links",
        items: [
          { href: "/shop/little-posy", label: "The Little Posy", text: "A small hand-tied bunch for a windowsill or bedside." },
          { href: "/shop/garden-bouquet", label: "The Garden Bouquet", text: "A fuller, naturally arranged mix of the season." },
          { href: "/shop/harlow-brook-bunch", label: "The Harlow Brook Bunch", text: "The most generous bouquet, for occasions that deserve it." },
          { href: "/subscriptions", label: "Flower subscriptions", text: "A fresh bouquet each month of the season, given as a gift." },
          { href: "/wholesale", label: "Wholesale & markets", text: "Seasonal flowers for shops, farm stands, cafés and inns." },
        ],
      },
      { type: "h2", text: "Why order from a local flower farm?" },
      {
        type: "p",
        text: "Local flowers are grown outdoors in the Vermont season and picked for the day you collect them, so they haven't spent days in transit. You also get varieties you won't find in a supermarket bucket, and every bouquet is a little different, because it's made from whatever is blooming that week.",
      },
      { type: "h2", text: "Flowers for someone else" },
      {
        type: "p",
        text: "Add a free handwritten card to any bouquet, and put the name of whoever is collecting it in the checkout note. For something that lasts, a gift subscription gives a fresh bouquet each month, and the recipient chooses their own pickup days.",
      },
      { type: "h2", text: "Do you deliver?" },
      {
        type: "p",
        text: "Not yet: every order is collected at the farm in Hartland during your pickup time. If you'd like flowers for someone who can't collect them, collect a bouquet and bring it to them yourself, or give a subscription so they can choose days that suit them.",
      },
    ],
  },
];

export const guideBySlug = (slug: string) => guides.find((g) => g.slug === slug);
