/**
 * Wholesale & Markets copy and form options.
 * PROVISIONAL: every offering, the season window and the buyer answers are starting points for Sarah to confirm
 * (see docs/LAUNCH_CHECKLIST.md). No prices, minimums, delivery or guarantees are published until she does.
 * The partner types describe who the page is for; they are not claims about existing customers.
 */
export const WHOLESALE_BUSINESS_TYPES = [
  "Farm stand or general store",
  "Farmers market vendor",
  "Boutique or gift shop",
  "Café, bakery or restaurant",
  "Inn, B&B or hospitality",
  "Office or other business",
  "Something else",
] as const;

export const WHOLESALE_USES = ["Resale to customers", "Display or décor", "Events", "Not sure yet"] as const;

export const wholesaleContent = {
  hero: {
    eyebrow: "Wholesale flowers from Hartland, Vermont",
    title: "Fresh from our farm. Beautiful in your shop.",
    body: "Seasonal, hand-grown Vermont flowers for the shops, farm stands, markets and cafés of the Upper Valley that appreciate something a little different.",
    facts: [
      ["Grown in", "Hartland, Vermont"],
      ["Season", "Early summer to the first frost"],
      ["Collection", "From the farm, on an agreed day"],
      ["You deal with", "The grower, directly"],
    ],
  },
  partners: {
    title: "Made for places like yours.",
    body: "Looking for a local flower supplier in the Upper Valley? Locally grown flowers give people another reason to come in, linger and come back. If your customers care where things come from, they'll notice these.",
    items: [
      { title: "Farm stands & general stores", text: "Wrapped bouquets by the register, ready to go home with everything else." },
      { title: "Farmers markets", text: "Fresh bunches to round out a stall, or a supply through the season." },
      { title: "Boutiques & gift shops", text: "Something living among the candles, cards and gifts." },
      { title: "Cafés, bakeries & restaurants", text: "Small arrangements for tables and counters, changed with the season." },
      { title: "Inns & B&Bs", text: "Flowers for the front desk, the rooms and the breakfast table." },
      { title: "Offices & local businesses", text: "A regular bunch that makes a workplace feel looked after." },
    ],
  },
  why: {
    eyebrow: "Why farm-grown",
    title: "Flowers with a story your customers can see.",
    items: [
      { title: "Grown in Hartland", text: "Every stem comes from Sarah's garden in Vermont's Upper Valley, grown outdoors in the Vermont season." },
      { title: "Picked for your order", text: "Flowers are cut by hand for your collection day, not ordered in from far away." },
      { title: "Garden varieties", text: "Zinnias, dahlias, cosmos, snapdragons and more, chosen from whatever is at its best that week." },
      { title: "One grower to talk to", text: "You deal directly with Sarah, who grows and picks the flowers herself." },
    ],
  },
  offerings: {
    title: "What we could grow for you",
    note: "What's possible depends on the garden and the week, so treat these as a starting point. Tell Sarah what you have in mind and she'll be honest about what the garden can do.",
    items: [
      { title: "Wrapped bouquets for resale", text: "Hand-tied and wrapped, ready for your customers to take home.", provisional: true },
      { title: "Seasonal mixed bunches", text: "Simple, generous bunches of what's blooming, for buckets by the door.", provisional: true },
      { title: "Bulk cut stems", text: "Buckets of mixed or single-variety stems for your own arranging.", provisional: true },
      { title: "Arrangements for displays", text: "Small arrangements for counters, tables and shop windows.", provisional: true },
      { title: "A regular order", text: "A weekly or fortnightly order through the season, agreed in advance.", provisional: true },
    ],
  },
  season: {
    eyebrow: "Availability",
    title: "Grown to Vermont's calendar.",
    body: "The garden runs from early summer until the first hard frost, and the mix changes every few weeks. Tell us roughly how many stems or bouquets you'd like, how often, and from when. We'll plan around that and tell you what to expect.",
  },
  questions: [
    {
      q: "How does wholesale pricing work?",
      a: "It depends on the flowers, the season and the quantity, so Sarah quotes each business directly once she knows what you need. Asking doesn't commit you to anything.",
    },
    {
      q: "Is there a minimum order?",
      a: "There are no fixed minimums yet. Tell us the quantity you have in mind and we'll tell you whether the garden can supply it.",
    },
    {
      q: "How are orders collected?",
      a: "Orders are collected from the farm in Hartland, Vermont, on a day we agree together. If collection would be difficult for you, mention it in your inquiry and we'll talk it through.",
    },
    {
      q: "Will the flowers be the same every week?",
      a: "No two weeks are quite alike, because everything grows outdoors. We'll talk through what's in season before each order, so you know what's coming.",
    },
    {
      q: "Can you supply flowers all year?",
      a: "No. Our flowers follow the Vermont growing season, roughly early summer to the first hard frost. Inquiries for next season are welcome at any time.",
    },
  ],
  inquiry: {
    title: "Let's talk about flowers for your business.",
    body: "Tell us a little about your business and what you have in mind. Sarah reads every inquiry herself and will reply by email.",
  },
};
