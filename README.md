# Harlow Brook Flowers

The online shop for Harlow Brook Flowers, a small family flower farm run by Sarah Stewart Taylor in Hartland, Vermont.
Customers order seasonal bouquets for local pickup or give prepaid seasonal flower subscriptions. Sarah manages
everything from a simple admin area.

> **Status: preview / demo mode.** Products, prices, photos and pickup dates are provisional, and checkout is a clearly
> labelled demonstration until Stripe is connected and Sarah approves the catalog. See
> [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md).

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit ADMIN_EMAIL / ADMIN_PASSWORD
npm run db:setup               # creates ./data/harlow-brook.db, seeds the demo catalog and an admin login
npm run dev                    # http://localhost:3000  (admin: /admin)
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build (runs migrations first) / serve it |
| `npm test` | Unit and integration tests (pricing, availability, order state machine, Stripe webhook) |
| `npm run typecheck` / `npm run lint` | TypeScript strict check / ESLint |
| `npm run db:migrate` / `npm run db:seed` | Apply migrations / seed demo data (safe to re-run) |
| `npm run db:generate` | Create a new migration after editing `src/server/db/schema.ts` |
| `npm run admin:create -- --email you@example.com` | Create or reset an admin login |
| `npm run stripe:listen` | Forward Stripe test webhooks to your local server (needs the Stripe CLI) |

## Documentation

- [docs/SETUP.md](docs/SETUP.md): environment, database, Stripe, email, photo storage, deployment
- [docs/EDITING.md](docs/EDITING.md): Sarah's guide to bouquets, prices, photos, pickup days and orders
- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): what's in demo mode, what needs approval, open blockers
- [docs/LOCAL_SEO.md](docs/LOCAL_SEO.md): local search strategy, Google Business Profile, Search Console, Analytics
- [docs/ASSET_MANIFEST.md](docs/ASSET_MANIFEST.md): every image, its placement, source and license

## How it's built

- **Next.js 16 App Router** (React 19, TypeScript strict, Cache Components / Partial Prerendering). Pages prerender
  to static shells; live stock and pickup availability stream in.
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`. Type: Gloock + Instrument Serif italic for the
  wordmark lockup only, Newsreader (optical sizes) for headings, Hanken Grotesk for text and interface. Palette: cream, paper and ink. Visual direction: the cream/editorial serif style of
  the Maison Véra Framer template, with a homepage hero modelled on the reference composition (giant wordmark behind a
  transparent bouquet).
- **Drizzle ORM + libSQL**: a SQLite file locally, Turso (hosted libSQL) in production.
- **Stripe Checkout** (hosted) for payments, with signature-verified, idempotent webhooks.

```
src/
  app/(site)/        storefront routes (home, shop, product, subscriptions, about, farm, faq, contact, cart, checkout…)
  app/admin/         admin area (login + protected panel)
  app/api/           Stripe webhook, calendar files, CSV exports, cron sweep
  app/actions/       server actions for the storefront (cart pricing, checkout, forms)
  components/        UI: ui/ (primitives), site/ (chrome), home/, shop/, cart/, subscriptions/, forms/, admin/
  content/           editable copy (home, wholesale, FAQ), the image asset manifest
  domain/            typed models + validation (catalog, cart, orders, settings)
  server/            database, pricing, availability, orders state machine, Stripe, email, auth, storage
  lib/               site config, formatting, time zone helpers, SEO helpers
scripts/             migrate, seed, create-admin
tests/               vitest suites
drizzle/             SQL migrations
```

### Commerce guarantees

- Prices and totals are computed only on the server from the database (`src/server/pricing.ts`). The browser cart
  stores selections, never prices.
- Checkout reserves stock and pickup-day capacity inside a single write transaction, so concurrent checkouts can't
  oversell (covered by a test that races three checkouts for the last unit).
- Unpaid checkouts hold stock for 60 minutes, then release automatically (webhook, sweep, or the next checkout).
- Payment is confirmed only by a verified Stripe webhook or by retrieving the session from Stripe on the success
  page. Both paths are idempotent and replay-safe.
- Card details never touch this server; Stripe Checkout hosts payment (with Apple Pay / Google Pay / Link when enabled).
