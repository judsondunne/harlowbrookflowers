# Launch checklist

The site is complete and fully working end to end in **demo mode**. Nothing here is a real sale yet. This list is
what stands between the preview and opening the shop.

## What is still demo or provisional

| Area | Current state | To go live |
| --- | --- | --- |
| Payments | Demo checkout (no Stripe key). Orders are labelled demos and excluded from sales totals. | Connect Stripe (test first, then live). See SETUP.md §3. |
| Products & prices | The five products and prices from the brief ($20 / $35 / $50 / $105 / $210) are seeded as provisional. A sample *draft* product shows how drafts work. | Sarah approves each product, price, size label and description. |
| Stem counts | "About 10 / 20 / 30+ stems" are placeholders. | Sarah confirms or edits the size labels. |
| Photography | Apart from Sarah's portrait, imagery is licensed **sample photography** from Unsplash (see ASSET_MANIFEST.md), marked with a small "Sample photo" note. Bouquet cutouts were made from those photos. | Replace with Harlow Brook's own photos, then set `labelSamplePhotos: false` in `src/lib/site.ts`. |
| Portrait | Sarah's own photo (holding *Agony Hill*) is used on the homepage and About page, as requested. | Confirm the photographer credit and that she's happy with the crop. |
| Wholesale | `/wholesale` is live with **provisional** offerings, season window and buyer answers (`src/content/wholesale.ts`). No prices, minimums or delivery are published. Inquiries are saved to Admin → Wholesale and emailed to the notification address. | Sarah confirms which offerings she'll actually take on, and how collection works. |
| Search indexing | `noindex` everywhere while the site runs on a `*.vercel.app` or localhost URL. | Set `NEXT_PUBLIC_SITE_URL` to the real domain; check `robots.txt` allows crawling. |
| Pickup calendar | 10 rolling demo pickup days (Wed 4–6:30 pm, 12 bouquets; Sat 9–noon, 24 bouquets). | Delete them; add the real season's days and capacities. |
| Subscription schedule | Season of Flowers starts Jun/Jul/Aug 2027 (3 bouquets); Six Months runs May–Oct 2027 (6 bouquets). Stock: 40 and 25 gifts. | Confirm months are feasible in Hartland (May and October may be thin) and how many gifts to sell. |
| Pickup instructions | Placeholder text: "[Sarah to add the pickup address…]". | Write real instructions in Admin → Settings. |
| Contact email | `hello@harlowbrookflowers.com` (placeholder). | Set `NEXT_PUBLIC_CONTACT_EMAIL` to the real inbox. |
| Email delivery | Saved to the admin outbox only. | Connect Resend (SETUP.md §4); set the notification email. |
| Photo uploads in production | Local disk only. | Add Vercel Blob (SETUP.md §5). |
| Database | Local SQLite file; the Vercel preview uses a disposable copy until a hosted database is connected. | One command: `vercel integration add tursocloud/database`, then redeploy (SETUP.md §1). |

## Business decisions Sarah needs to make

- [ ] Product line-up, prices and size descriptions
- [ ] Pickup days, times and how many bouquets per day
- [ ] Order cutoff (currently 36 hours before pickup)
- [ ] **Cancellation & refund policy.** The site currently proposes 48 hours' notice for a full refund (FAQ + Terms).
- [ ] Missed-pickup policy (currently "write to us and we'll try to rearrange")
- [ ] Subscription details: start months, whether a weather-missed month gets a make-up bouquet (currently promised),
      how pickup dates are communicated (currently "Sarah emails each month's dates")
- [ ] Whether a color-preference note is honored "where possible" (currently promised in copy)
- [ ] The crop list on the homepage and farm page ("Peonies, sweet peas…"): currently a *typical Vermont season*, not
      a statement of what Harlow Brook grows. Replace it with the real list.
- [ ] Operational claims in copy: "picked for your pickup day", "cut close to pickup, never shipped", "hand-tied",
      "Sarah writes your card". Confirm each is true, or soften it.
- [ ] Biography: the About page uses only facts from sarahstewarttaylor.com (former journalist and teacher; lives
      with her family on a Vermont farm raising sheep and blueberries; the Maggie D'arcy, Sweeney St. George and
      1960s Vermont series; Agatha, Hammett and Sue Grafton Memorial award nominations) plus the brief (grows and
      hand-picks flowers in Hartland; sells at farmers markets). Confirm the flower garden is on the same family farm,
      and add any personal words she'd like. **No quotes are attributed to her.**
- [ ] Which farmers markets to mention by name (none are named now)
- [ ] **Wholesale:** which offerings are real (wrapped bouquets, mixed bunches, bulk stems, display arrangements,
      regular orders), whether there's a minimum, how and where orders are collected, and how far she'd travel, if at
      all. Edit `src/content/wholesale.ts`; nothing there is a commitment yet.
- [ ] Gift pages: read one end to end (place a test gift order) and confirm the wording about pickup dates matches
      how Sarah will actually contact recipients.
- [ ] Set **Admin → Settings → order notification email** so wholesale inquiries and contact messages reach her
      inbox, not just the admin outbox.

## Legal & tax (needs professional review)

- [ ] Privacy policy and Terms of sale are **initial drafts** and say so on the page. Have them reviewed.
- [ ] **Sales tax:** confirm whether Vermont sales tax applies to these sales and whether to register. Set the rate in
      Admin → Settings (0% hides the tax line). This is not tax advice.
- [ ] Business legal name for the legal pages and Stripe.
- [ ] Decide on Google Analytics before enabling it (and keep the privacy policy in step).

## Technical go-live steps

1. Provision Turso, Vercel Blob, Resend and Stripe (SETUP.md).
2. Set production environment variables, including `NEXT_PUBLIC_SITE_URL` (the real domain also lifts the pre-launch
   `noindex`).
3. Deploy; run `db:migrate` and the first `db:seed` against production; change the admin password.
4. Replace demo pickup days, products, photos and settings with approved content.
5. Place a real **test-mode** order end to end (card `4242 4242 4242 4242`), check the email and admin, then refund it.
6. Switch to live keys, set `ALLOW_LIVE_PAYMENTS=true`, tick **Catalog approved**.
7. Submit the sitemap in Google Search Console; set up Google Business Profile if eligible (LOCAL_SEO.md).

## Known limitations

- Fulfillment is local pickup only. The data model keeps pickup windows separate from orders, so a delivery option can
  be added later as another fulfillment type without reworking checkout.
- Recipients of gift subscriptions don't choose pickup dates online; Sarah arranges them by email (intentionally
  simple for the first season).
- Customers have no accounts by design (guest checkout); order links in emails use unguessable tokens.
- Lighthouse (mobile profile, local production build, October 2026): Performance 93 home / 97 shop / 100 subscriptions;
  Accessibility, Best Practices and SEO 100 on all three; CLS ≤ 0.03; TBT ≤ 30 ms. Simulated mobile LCP on the
  homepage is 3.3 s, **above the 2.5 s target** under Lighthouse's throttled slow-4G simulation (real unthrottled LCP
  ≈ 0.15 s). Re-measure on the real host and watch the Core Web Vitals report in Search Console once there's traffic.
