# Search plan: owning "fresh cut flowers" in the Upper Valley

The goal: when someone within half an hour of Hartland searches **fresh cut flowers near me**, **flowers
Woodstock VT**, **fresh cut flowers Vermont**, **flower farm near me** or **flower subscription Vermont**, Harlow
Brook is the answer, in the map pack and in the results below it. This is the whole plan: what the website already
does, and the off-site work (most of the "near me" battle) that only Sarah can do.

## How these searches are actually decided

- **"…near me" and town searches** are won in the **map pack** (the three businesses with pins). Google ranks those
  by *relevance* (categories, name, what the profile and website say), *distance* (where the searcher is) and
  *prominence* (reviews, links, mentions around the web). A Google Business Profile is required to appear at all.
- **"fresh cut flowers Vermont", "flower subscription Vermont", "Vermont flower season"** are mostly won in the
  ordinary results, by pages that answer the search better than anyone else and that other sites link to.
- **AI answers** (Google AI Overviews, ChatGPT, Perplexity) pull from the same pages plus listings and reviews.
  `/llms.txt` gives them a clean factual summary.

### Who we're up against (October 2026 searches)

- Results for these searches are dominated by **directories** (LocalHarvest, NOFA-VT, Slow Flowers, Zola) and by
  **farms elsewhere in Vermont** (The Painted Tulip in Waterbury Center, Four Blooms in Bristol, Mountain Flower Farm
  in Warren, Valley Acres in Wallingford). **No Upper Valley flower farm owns these searches.**
- For generic "flowers near me" and "flower delivery", **national wire services** (1-800-Flowers, FTD, Teleflora and
  local florists that relay their orders) dominate with paid ads and delivery promises. We don't fight them on
  "delivery". We beat them on *locally grown, fresh cut, flower farm, flower subscription* and on the map pack for
  Hartland and the towns around it.
- Strategy, in one line: **be listed everywhere the directories rank, own the map pack locally, and publish the best
  page on the internet for each local question.**

## What the website already does

| Area | What's in place |
| --- | --- |
| Titles & descriptions | Keyword-first, unique per page: "Fresh Cut Flowers in Hartland, Vermont", "Fresh Cut Flower Bouquets, Hartland VT", "Flower Subscription in Vermont", "Wholesale Flowers in Vermont", product pages with price. |
| Content | Three original guides targeting real searches: `/guides/vermont-flower-season`, `/guides/how-to-keep-cut-flowers-fresh`, `/guides/fresh-cut-flowers-upper-valley` (towns and honest drive times, no doorway pages). FAQ answers local questions. |
| Structured data | `WebSite` (site name), `Florist` with locality, town-level geo, the ten towns served, `knowsAbout`, an offer catalog of every bouquet and plan, founder, logo (`/logo.png`); `Product` with price, availability, on-site pickup; `Article` for guides; `Service` for wholesale; `BreadcrumbList`; `FAQPage`; `Person` for Sarah. |
| Sitemap & crawling | `sitemap.xml` with every page, bouquet and guide, including image entries for Google Images; `robots.txt`; canonical URLs; `noindex` on cart, checkout, orders, gift pages and anything not on the real domain. |
| Sharing | A designed link-preview card for every page and bouquet (iMessage, Facebook, Slack, Pinterest). |
| Local signals | Hartland, the Upper Valley and nearby towns named naturally in copy; geo meta tags; `/llms.txt`. |
| Speed | Static prerendering, AVIF/WebP images, self-hosted fonts, light animation library. Check Core Web Vitals in Search Console after launch. |

## The launch checklist (do these in order)

**Week 1: switch it on**

1. Point the real domain at Vercel and set `NEXT_PUBLIC_SITE_URL` to it. This lifts the pre-launch `noindex`.
2. **Google Search Console:** verify with `GOOGLE_SITE_VERIFICATION`, submit `/sitemap.xml`, then use URL
   inspection → *Request indexing* for `/`, `/shop`, `/subscriptions`, `/wholesale` and the three guides.
3. **Bing Webmaster Tools:** verify with `BING_SITE_VERIFICATION` (or import from Search Console) and submit the
   sitemap. Bing also feeds DuckDuckGo, Yahoo and several AI assistants.
4. **Google Business Profile** (the single biggest lever for "near me"):
   - Name: exactly **Harlow Brook Flowers**. No keywords added to the name; Google suspends profiles for that.
   - Set it up as a **service-area business** and hide the street address (the farm is a home). Service area:
     Hartland, Windsor, Woodstock, Quechee, White River Junction, Norwich, Lebanon, Hanover, Plainfield, Cornish.
   - Primary category: **Florist**. Additional categories (pick the ones Google offers when you type them):
     *Flower farm* or *Farm*, *Wholesale florist*. Check Google's current eligibility rules for appointment-only
     pickup before applying.
   - Description: say plainly what we are, *locally grown fresh cut flowers from a family farm in Hartland,
     Vermont; seasonal bouquets for pickup, flower subscriptions and wholesale*, and link to the website.
   - Add every bouquet as a **Product** with its price and photo, the website as the order link, real hours for
     pickup days in season, and **at least 10 real photos** (the garden, Sarah, real bouquets).
5. **Apple Business Connect** (Apple Maps and Siri: "flowers near me" on every iPhone) and **Bing Places**: same
   details, same name, same website. Most small farms skip these, which is exactly why they're worth doing.

**Weeks 2–4: prominence**

6. **Reviews.** Ask every pickup customer for a Google review: a small card in each bouquet with a QR code to the
   review link, and one line in the confirmation email. Reply to every review. Never buy, swap or write reviews,
   and don't add testimonials to the site until real ones exist (with permission).
7. **Listings that already rank for our searches** (each one is also a backlink and a citation; keep the name,
   town and website identical everywhere): LocalHarvest, Slow Flowers member directory, NOFA-VT farm listings,
   Vermont Agency of Agriculture / Vermont Grown directories, Vital Communities' Valley Food & Farm guide, the
   Hartland town website and newsletter, Upper Valley farmers market vendor pages, Yelp, Facebook, Instagram.
8. **The strongest links available:** a line and link from **sarahstewarttaylor.com** ("Sarah also grows flowers
   at Harlow Brook"), her publisher's author page, and a local press story. A mystery novelist who grows flowers is
   a natural feature for the **Valley News**, Vermont Public or Seven Days; one article is worth more than any amount
   of on-page tweaking.
9. **Wholesale partners:** ask each shop or café that stocks the flowers to say so on their site or social posts
   ("flowers by Harlow Brook Flowers, Hartland") with a link.

**Every week in season**

10. Post a **Google Business Profile update** with a real photo of that week's bouquets and a link to `/shop`.
11. Update the season note in Admin → Settings ("The first dahlias are in"). Fresh, specific, local content is a
    ranking signal and gives people a reason to come back.
12. Pin real bouquet photos on **Pinterest** (bouquet and wedding-flower searches live there) linking to the shop and
    guides; post the same on Instagram.
13. Add a guide when there's a real question to answer (ideas: *dahlia season in Vermont*, *flowers for a Vermont
    wedding or event*, *what to do with a bouquet when the flowers fade*). One useful page a month beats ten thin ones.

## Keyword map (one clear page per search)

| Search | Page | Notes |
| --- | --- | --- |
| Harlow Brook Flowers (brand) | `/` | `WebSite` name, logo, GBP. |
| fresh cut flowers Hartland VT · fresh cut flowers Vermont · locally grown flowers Vermont | `/` | Title and h1 lead with these. |
| flower bouquets Hartland · fresh flower bouquet Upper Valley | `/shop`, `/shop/[bouquet]` | Product data with price and pickup. |
| fresh cut flowers near me · flowers Woodstock VT · flowers Hanover NH · flowers White River Junction | GBP + `/guides/fresh-cut-flowers-upper-valley` | Map pack is GBP; the guide wins the organic slot with real drive times. |
| flower subscription Vermont · flower CSA Upper Valley · monthly flowers gift | `/subscriptions` | No Upper Valley competitor offers a giftable season. |
| flower gifts Upper Valley · birthday flowers Woodstock | `/gift-flowers` | Honest: pickup in Hartland, card included. |
| wholesale flowers Vermont · local flower supplier Upper Valley · flowers for farm stands | `/wholesale` | `Service` data; partner links help most. |
| Vermont flower season · when do dahlias bloom in Vermont · peony season Vermont | `/guides/vermont-flower-season` | Informational, link-worthy. |
| how to keep cut flowers fresh · make flowers last longer | `/guides/how-to-keep-cut-flowers-fresh` | National competition; long-tail and image traffic. |
| flower farm Hartland VT · Vermont flower farm · Sarah Stewart Taylor flowers | `/about` | |

## Measuring it

- **Search Console → Performance:** watch impressions and position for the searches above, monthly. Pages with
  impressions but few clicks need a better title. Queries you didn't expect are ideas for guides.
- **Google Business Profile → Performance:** searches, map views, website clicks, calls.
- **Orders:** the admin shows where sales come from; optionally enable GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID`).

## Rules we keep

No fake reviews or testimonials, no keyword-stuffed business name, no copy-paste town pages, no claims of delivery or
shops in towns we don't have, no hidden text. They all risk penalties, and none of them are needed to win here.
