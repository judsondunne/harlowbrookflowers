# Local SEO plan

With no marketing budget, search is the main way new customers will find Harlow Brook. The goal is to be the obvious
answer when someone nearby looks for local, seasonal flowers or a flower gift, without keyword stuffing or fake
location pages.

## The opportunity

A quick look at the local landscape (October 2026):

- No flower farm in **Hartland** itself turns up with online ordering. Results for "Hartland VT florist" are mostly
  wedding-directory listings for regional event florists.
- Nearby farms in the Upper Valley, such as Sweetland Farm and Honey Field Farm in Norwich and Deep Meadow Farm near
  Ascutney/White River Junction, offer **vegetable CSAs with flowers as an add-on or pick-your-own**. A dedicated,
  giftable **flower subscription** in the Upper Valley appears to be an open niche.
- Vermont flower farms with good web presences (e.g. Four Blooms Farm in Bristol, Farmhouse Flowers in Moretown, West
  Lane Flowers in Colchester) are outside the Upper Valley, so local intent favors a Hartland farm.

## Keyword map (one clear page per intent)

| Search intent | Target page | Notes |
| --- | --- | --- |
| Harlow Brook Flowers (brand) | `/` | Title leads with the brand; Florist structured data. |
| fresh / locally grown flowers Hartland VT, Vermont flower farm | `/`, `/our-farm` | Natural mentions of Hartland, Upper Valley, Connecticut River. |
| flower bouquets Hartland VT, seasonal Vermont bouquets | `/shop`, `/shop/[bouquet]` | Product structured data with on-site pickup. |
| flower subscription Vermont, flower subscription gift, Upper Valley flower CSA | `/subscriptions` | The most differentiated page; FAQ structured data. |
| flower gifts Upper Valley (Woodstock, Quechee, Windsor, WRJ, Hanover) | `/gift-flowers`, `/our-farm` | Towns are mentioned honestly as places customers come from, with pickup in Hartland. No town-specific doorway pages, and no claims of delivery or shops in those towns. |
| how to order / pickup | `/how-it-works`, `/faq` | Answers real questions; FAQPage structured data. |

## Already implemented

- Unique titles and meta descriptions per page; canonical URLs; Open Graph image (`public/og/harlow-brook.jpg`).
- `sitemap.xml` (pages + bouquets) and `robots.txt` (keeps admin, cart, checkout and order pages out of search).
- Structured data:
  - **Florist** (a LocalBusiness type) with *locality only* (Hartland, VT 05048). The private home address is
    never published.
  - **Product** with real price and availability, plus on-site pickup.
  - **BreadcrumbList**, **FAQPage**, and **Person** (Sarah, linking to her author site).
- Semantic headings, descriptive alt text on every image, internal links between related pages.
- Fast pages: static prerendering, optimized AVIF/WebP images, preloaded hero image, self-hosted fonts.

## Google Search Console (free, do this first)

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → Add property → URL prefix.
2. Choose "HTML tag", copy the `content="…"` value into `GOOGLE_SITE_VERIFICATION`, redeploy, then verify.
3. Sitemaps → submit `https://<your-domain>/sitemap.xml`.
4. Check back monthly: queries people use, pages with impressions but few clicks (improve those titles).

## Google Business Profile (only if eligible)

A Business Profile is the most valuable free local listing, but Google's rules matter here:

- A business qualifies if it has a location customers can visit **or** it serves customers at their locations.
  Scheduled pickup at the farm *may* qualify as customer contact during stated hours, but Google can treat a private
  residence with appointment-only pickup strictly. Read Google's current
  [guidelines for representing your business](https://support.google.com/business/answer/3038177) before applying.
- **Don't** list the home address publicly unless Sarah is comfortable with it. If the profile is set up, the address
  can be hidden and a **service area** used instead (e.g. Hartland, Windsor, Woodstock, Quechee, White River Junction).
- Use the exact business name "Harlow Brook Flowers" (no added keywords), the category "Florist" or "Flower farm" if
  available, real pickup hours, the website, and real photos.
- Ask genuine customers for reviews after pickup. Never post or buy fake ones, and don't add testimonials to the site
  until real ones exist.

## Simple, honest growth ideas

- Get listed (free) where locals look: Vermont Farm to Plate / Vermont Fresh Network directories, Upper Valley farmers
  market vendor lists, LocalHarvest, the Hartland town website or newsletter.
- A link from sarahstewarttaylor.com ("Sarah also grows flowers…") would carry real authority.
- Each season, update the homepage season note and crop list. Fresh, specific, local content helps.
- Post real photos of each week's bouquets on the farm's social accounts and link them to `/shop`.

## Google Analytics (optional)

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable GA4 (configured without advertising features). Useful events to watch
in GA: product views, add to cart, begin checkout, purchase. If you enable it, mention analytics cookies in the
privacy policy (it already describes GA as optional).
