# Running the shop (a guide for Sarah)

Everything below happens at **yoursite.com/admin**. No code needed. Changes appear on the site as soon as you save.

## Bouquets and prices

**Admin → Products → (choose a bouquet)**

- **Price:** type the new price in dollars and save. Every page, the cart and checkout update together.
- **Status:**
  - *Active*: listed and for sale.
  - *Hidden*: not listed, not for sale, but the link still works.
  - *Draft*: invisible to customers. Use it to prepare something new.
  - *Archived*: retired.
- **Stock available:** leave it blank to limit a bouquet only by how many you can make per pickup day. Enter a number
  (e.g. 8) for something genuinely limited. The shop shows "Only 3 left" when it's low and "Sold out" at zero. Stock
  comes back automatically if a checkout is abandoned or an order is cancelled.
- **Size label, tagline, summary, description, what's included, care notes:** the words customers see. Put each list
  item on its own line.
- **Available from / until:** optional seasonal dates. Outside them, the bouquet shows "Out of season".
- **Card image size (%):** how large the bouquet appears in shop cards, so a Posy looks smaller than a Bunch.

**New product:** Admin → Products → New product. Start as a *Draft*, add photos, then set it to *Active*.

## Photos

On a product's page, under **Photos**:

1. **Upload new photos** (JPEG, PNG, WebP or AVIF; phone photos are fine) and save.
2. Type a short **description** of each photo (alt text). It helps people using screen readers and helps Google.
3. Use the **↑ / ↓** buttons to choose the main photo (the first one).
4. Untick **Sample** on your own photos. Sample photos show a small "Sample photograph" label on the site.

**For the cleanest shop, photograph bouquets the same way each time:** the same spot, soft daylight, a plain pale
wall or sheet behind, bouquet upright and centered, phone held at the same height. The shop's main bouquet images are
"cutouts" (transparent background). To make one, on a Mac or iPhone, open the photo, press and hold the bouquet,
choose **Copy Subject** (or Share → Save as PNG), then upload it with **Type: Cutout**. Full-frame photos work too;
upload them as **Type: Photo**.

To replace the sample photos on the rest of the site (homepage, farm and about pages), save new photos with the same
file names in `public/images/photos/`, or ask your web person. [ASSET_MANIFEST.md](ASSET_MANIFEST.md) lists them all.

## Pickup days

**Admin → Pickup days**

- **Add pickup days:** pick a date, start and end time, and how many bouquets you can make. Choose *Repeat weekly* to
  add a whole season at once (e.g. every Wednesday and Saturday from June 20 to September 26).
- **Capacity:** each order takes one spot per bouquet. When a day is full, it shows "Fully booked".
- **Close a day** (weather, a family event): set it to *Closed*. Existing orders stay; nobody new can choose it.
- Orders for a day close a set number of hours beforehand (Admin → Settings; currently 36 hours) so you know
  what to pick.
- **Picking list:** open any day to see how many of each bouquet to make, every card message, and who's coming.
  **Mark all ready** when the bouquets are done. Print it with your browser's print button.

## Orders

**Admin → Orders**: new paid orders appear here (and in your email once email is connected).

- Open an order to see the customer, pickup day, items and card messages.
- Use **Mark ready**, then **Mark picked up**.
- **Cancel / refund:** refund the money in the Stripe dashboard (the order page links straight to the payment), then
  mark it cancelled or refunded here, which returns the stock.
- **Notes:** private notes, and a "needs attention" flag that puts the order on the dashboard.
- **Export CSV** for a spreadsheet of orders (or of a single pickup day).

## Gift subscriptions

**Admin → Gift subscriptions** lists every gift: who it's for, who gave it, their note, and the months it covers.

- Before the season, email each recipient (or the giver, if no recipient email was given) with the month's pickup
  dates.
- Each time a recipient collects a bouquet, press **+**. When all are collected, the gift completes on its own.

## Messages and email list

- **Messages:** contact-form notes. Reply by email, then mark them replied or archive them.
- **Email list:** people who asked to hear when pickups open, with the exact consent they gave. Export it as CSV for
  your newsletter tool. Only email people on this list.

## Settings

- **Online ordering is open:** turn this off to pause checkout (the site stays up and explains why).
- **Pickup location (public)** and **pickup instructions (private, sent only after purchase):** write the address,
  parking and where to find the flowers in the private field. It never appears on the public site.
- **Announcement bar**, **season note**, **notification email**, **order cutoff hours**, and **sales tax rate**.
- **Catalog approved:** switch on once products, prices and photos are final. Live payments require it.
