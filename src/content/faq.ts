/**
 * FAQ copy. PROVISIONAL: cancellation, refund and missed-pickup policies are proposed defaults
 * that Sarah must confirm (see docs/LAUNCH_CHECKLIST.md).
 */
export type Faq = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "pickup",
    title: "Pickup",
    items: [
      {
        q: "Where do I pick up my flowers?",
        a: "At the farm in Hartland, Vermont. The farm is also a family home, so the exact address and directions are shared in your order confirmation rather than published online.",
      },
      {
        q: "Can you deliver?",
        a: "Not yet. For now every order is collected in Hartland during a scheduled pickup time. If we add local delivery later, we'll say so here and on the shop.",
      },
      {
        q: "Can someone else collect my order?",
        a: "Of course. Add their name in the note at checkout, and they just give your name or theirs when they arrive.",
      },
      {
        q: "When do orders close for a pickup day?",
        a: "Each pickup day has a cutoff ahead of time so Sarah can plan what to pick. Days that have closed or filled up are marked in the pickup list.",
      },
      {
        q: "What if I can't make my pickup time?",
        a: "Write to us as soon as you know and we'll do our best to arrange another time. Flowers that aren't collected can't be kept for long, so please let us know early.",
      },
    ],
  },
  {
    id: "flowers",
    title: "The flowers",
    items: [
      {
        q: "Will my bouquet look like the photo?",
        a: "It will be the same size and style, made with the same care, but the flowers themselves depend on what's blooming that week. The photos on the site are sample photography for now, which is why every product says so.",
      },
      {
        q: "Can I request colors or flowers?",
        a: "Leave a note at checkout. Sarah will do her best to honor it with what the garden has to give that week.",
      },
      {
        q: "How long will the flowers last?",
        a: "Freshly cut garden flowers usually last about a week with good care: trim the stems, use clean cool water, change it every day or two, and keep the vase out of direct sun.",
      },
      {
        q: "When is the season?",
        a: "Our flowers grow outdoors in Vermont, so the season runs from early summer until the first hard frost. Pickup days are posted through the season as the garden comes into bloom.",
      },
      {
        q: "Where can I get fresh cut flowers near Woodstock, Hanover or White River Junction?",
        a: "Harlow Brook is in Hartland, Vermont, between Windsor and White River Junction, about 15 to 25 minutes from most of the Upper Valley. Order online and collect your bouquet at the farm on the pickup day you choose.",
      },
    ],
  },
  {
    id: "gifts",
    title: "Gifts & subscriptions",
    items: [
      {
        q: "How does a gift subscription work?",
        a: "You choose a plan and a starting month, write a note, and pay once. Your recipient collects a Garden Bouquet in Hartland each month. Before the season begins, Sarah writes with the pickup dates so they can choose the one that suits them.",
      },
      {
        q: "Does the subscription renew?",
        a: "No. Subscriptions are prepaid for a set number of bouquets and never renew or charge you again.",
      },
      {
        q: "Will the recipient know it's from me?",
        a: "Yes. Your name and message go on the gift card. You can print the card yourself after checkout, or ask us to email your note to the recipient when the gift is confirmed.",
      },
      {
        q: "What if a month's bouquet can't be picked?",
        a: "Vermont weather has its say. If a month can't be picked at all, Sarah will arrange a make-up bouquet later in the season.",
      },
      {
        q: "Can I add a card to a single bouquet?",
        a: "Yes, at no charge. Choose \"Add a handwritten card\" on the bouquet's page and Sarah will tuck your note in.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders, changes & payment",
    items: [
      {
        q: "Do I need an account?",
        a: "No. Checkout is guest-only: you give your name and email so we can confirm your order, and that's all.",
      },
      {
        q: "How do I pay?",
        a: "Payment is handled securely by Stripe. You can pay by card, and with Apple Pay or Google Pay where your device supports it. We never see or store your card details.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "Write to us at least 48 hours before your pickup time and we'll change the day or refund you in full. Closer to pickup, the flowers may already be cut, so we'll do what we can.",
      },
      {
        q: "Are there any extra fees?",
        a: "No. The price you see is the price you pay, and pickup is free. If sales tax applies, it's shown before you pay.",
      },
      {
        q: "Do you sell flowers to shops, cafés and markets?",
        a: "Yes. We grow for local businesses too: wrapped bouquets to resell, seasonal bunches and stems by the bucket. Send a wholesale inquiry from our Wholesale & Markets page and Sarah will reply by email.",
      },
    ],
  },
];
