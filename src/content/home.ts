/**
 * Homepage copy. Kept here so wording can change without touching layout.
 * PROVISIONAL: operational claims (picking times, sizes, crop list) need Sarah's confirmation.
 */
export const homeContent = {
  hero: {
    heading: "Flowers from our garden, for your table.",
    body: "Seasonal bouquets grown and picked by hand in Hartland, Vermont, ready for you to collect at the farm. Or give someone a whole season of them.",
    trust: "Grown in Hartland · Local pickup",
  },
  features: [
    { icon: "sprout", title: "Grown in Hartland", text: "Field-grown in Vermont's Upper Valley" },
    { icon: "scissors", title: "Picked for pickup day", text: "Cut close to pickup, never shipped" },
    { icon: "hand", title: "Arranged by hand", text: "Every bouquet is one of a kind" },
    { icon: "gift", title: "Give a season", text: "Prepaid monthly bouquets" },
    { icon: "calendar", title: "Simple pickup", text: "Choose your day at checkout" },
  ],
  shop: {
    title: "Shop the garden",
    intro:
      "Three sizes, each hand-tied from whatever is blooming that week. Choose the one that suits the moment, and the garden takes care of the rest.",
  },
  story: {
    eyebrow: "From the garden",
    title: "Grown slowly. Given joyfully.",
    paragraphs: [
      "Harlow Brook Flowers is a small family flower farm in Hartland, Vermont. Sarah Stewart Taylor grows the flowers in her own garden on the farm and picks them by hand.",
      "You may know her bouquets from local farmers markets. Now you can order ahead, choose a pickup day, and collect your flowers at the farm.",
    ],
  },
  subscriptions: {
    eyebrow: "Flower subscriptions",
    title: "Give a season, not just a bouquet.",
    body: "One thoughtful gift, paid for once, that arrives again and again. Your recipient collects a Garden Bouquet in Hartland each month of the growing season.",
    steps: [
      { title: "Choose a plan", text: "Three months or the whole season." },
      { title: "Write a note", text: "We include it with the gift." },
      { title: "Pay once", text: "No renewals, no accounts." },
      { title: "Flowers each month", text: "Collected fresh in Hartland." },
    ],
  },
  pickup: {
    eyebrow: "How it works",
    title: "Ordered ahead, picked for you.",
    steps: [
      { title: "Choose your flowers", text: "Pick a bouquet size, or a subscription to give as a gift." },
      { title: "Pick a pickup day", text: "Choose from the open days and times. Each one has a limited number of bouquets." },
      { title: "Pay securely", text: "Guest checkout through Stripe. You'll get a confirmation with directions." },
      { title: "Collect in Hartland", text: "Your bouquet is picked for your day and waiting for you at the farm." },
    ],
  },
  season: {
    eyebrow: "Seasonal by nature",
    title: "Every bouquet is a little different.",
    // A typical Vermont cut-flower season. Sarah to confirm against what she actually grows.
    months: [
      { label: "Early summer", flowers: "Peonies, sweet peas, foxglove, early roses" },
      { label: "High summer", flowers: "Zinnias, snapdragons, cosmos, scabiosa" },
      { label: "Late summer", flowers: "Dahlias, sunflowers, rudbeckia, celosia" },
      { label: "Autumn", flowers: "Late dahlias, asters, grasses and seed heads" },
    ],
  },
  author: {
    eyebrow: "The grower",
    title: "Sarah Stewart Taylor",
    body: "Sarah is a mystery novelist, the author of the Maggie D'arcy series and Agony Hill, a historical mystery set in rural Vermont. She writes, and grows these flowers, on the family farm in Hartland.",
  },
};
