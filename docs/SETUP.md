# Setup & deployment

Everything is configured with environment variables. Copy `.env.example` to `.env.local` for local development; in
production, set the same variables in your host (e.g. Vercel → Project → Settings → Environment Variables).

## 1. Database

**Local:** nothing to install. `DATABASE_URL=file:./data/harlow-brook.db` (the default) creates a SQLite file.

```bash
npm run db:setup    # migrate + seed demo catalog, demo pickup days, default settings, admin login
```

**Production, the quick way (Vercel + Turso, free plan):** from the project folder, run

```bash
vercel integration add tursocloud/database
```

accept Turso's terms when asked, and let it connect the database to the project. It sets `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN`, which the app reads. Redeploy (`vercel deploy --prod`): the build runs `npm run db:bootstrap`,
which migrates the empty database and seeds the demo catalog, settings and pickup days once. Later deploys only
migrate. Add an admin login with `npm run admin:create` after `vercel env pull .env.local`.

While the site is on its `*.vercel.app` address with a real database, the demo checkout is switched on
automatically (no payment is taken), so the whole journey, including gift links, can be tried there.

**Production, by hand (Turso, hosted libSQL):**

1. Create a database at [turso.tech](https://turso.tech) (free tier is plenty for a small shop).
2. Set `DATABASE_URL=libsql://<your-db>.turso.io` and `DATABASE_AUTH_TOKEN=<token>`.
3. Run migrations and the first seed from your machine against production:
   ```bash
   DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npm run db:migrate
   DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:seed
   ```
   `npm run build` also runs migrations automatically (`prebuild`), so later schema changes apply on deploy.
4. After seeding, delete the demo pickup days in **Admin → Pickup days** and add Sarah's real calendar.

Schema changes: edit `src/server/db/schema.ts`, run `npm run db:generate`, commit the new file in `drizzle/`.

**Disposable preview on Vercel (no hosted database yet):** if `DATABASE_URL` is not set in Vercel, the build command
in `vercel.json` migrates and seeds a SQLite file with the demo catalog, and that file ships with the deployment.
Each server instance copies it to `/tmp` and works on the copy, so browsing, the cart and the gift builder all work,
but **nothing written persists** (contact messages, wholesale inquiries, sign-ups, admin edits), and separate
instances don't see each other's writes. For that reason checkout stays closed on such a preview ("Online ordering
opens soon"): don't set `ENABLE_DEMO_CHECKOUT` there, because an order made on one instance can't be found by the
next. The contact, wholesale and newsletter forms say plainly that the preview doesn't keep messages. Test the full
checkout locally (`npm run dev`), or connect Turso first. Once `DATABASE_URL` points at Turso, the seeding step is skipped and only migrations run.
Previews on `*.vercel.app` are also kept out of search engines automatically (see LOCAL_SEO.md).

## 2. Admin login

`npm run db:seed` creates the first admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (min. 12 characters). To add or reset
one later:

```bash
npm run admin:create -- --email sarah@example.com --name Sarah   # prompts for the password
```

Passwords are hashed with scrypt; sessions are random tokens stored hashed in the database, in an HTTP-only cookie.
Login is rate-limited. Every admin page, server action and export checks the session.

## 3. Payments (Stripe Checkout)

The shop runs in three modes, chosen automatically from `STRIPE_SECRET_KEY`:

| Mode | When | Behaviour |
| --- | --- | --- |
| **Demo** | no key | Checkout shows a clearly labelled "demo payment" page. Orders are marked as demos and never count as sales. Disabled in production unless `ENABLE_DEMO_CHECKOUT=true`. |
| **Test** | `sk_test_…` | Real Stripe Checkout with [test cards](https://docs.stripe.com/testing) (e.g. 4242 4242 4242 4242). A banner says it's test mode. |
| **Live** | `sk_live_…` | Refused unless `ALLOW_LIVE_PAYMENTS=true` **and** "Catalog approved" is switched on in Admin → Settings. |

Steps:

1. Create a Stripe account for the business; complete verification.
2. **Developers → API keys:** copy the *secret* key into `STRIPE_SECRET_KEY` (start with the test key).
3. **Webhook:** Developers → Webhooks → Add endpoint
   - URL: `https://<your-domain>/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. Local testing: install the [Stripe CLI](https://docs.stripe.com/stripe-cli), then
   `stripe login` and `npm run stripe:listen` (it prints a `whsec_…` secret for `.env.local`).
5. **Express checkout:** Settings → Payment methods → enable Apple Pay, Google Pay and Link. Stripe Checkout shows
   them automatically on supported devices. For Apple Pay, also add your domain under Payment method domains.
6. Branding: Settings → Branding → upload the logo, set the accent color to `#2A221D`.
7. When everything is approved: switch to the live key, set `ALLOW_LIVE_PAYMENTS=true`, tick "Catalog approved".

Refunds are issued from the Stripe dashboard. The webhook records them on the order, and you can mark the order
refunded in the admin (which returns stock).

## 4. Email (optional but recommended)

Order confirmations, Sarah's new-order notifications, gift notes and contact-form notifications use
[Resend](https://resend.com). Set `RESEND_API_KEY` and `EMAIL_FROM` (verify the sending domain in Resend first).
Without a key, every email is saved to **Admin → Settings → Email outbox** instead of being sent, so nothing is lost.
Set the notification address in Admin → Settings.

## 5. Product photo uploads in production

Local development saves uploads to `public/uploads/`. Serverless hosts can't write to disk, so in production create a
**Vercel Blob** store (Vercel → Storage → Blob) and set `BLOB_READ_WRITE_TOKEN`. Uploaded photos are converted to WebP
(max 2400px, transparency preserved).

## 6. Deploying (Vercel)

1. Push the repository to GitHub and import it in Vercel (framework: Next.js).
2. Add the environment variables above, plus `NEXT_PUBLIC_SITE_URL=https://<your-domain>`.
3. Add your domain in Vercel → Domains.
4. Optional: `CRON_SECRET=<random string>` enables `vercel.json`'s daily sweep of abandoned checkouts. Holds also
   release on every checkout and via Stripe's expiry webhook, so the cron is a backstop.

Other Node hosts work too (`npm run build && npm start`), including a single server with a SQLite file.

## 7. Optional integrations

- **Google Analytics 4:** `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…` (IP anonymized, ad features off). Mention it in the
  privacy policy before enabling.
- **Search Console:** `GOOGLE_SITE_VERIFICATION=<token>` adds the verification meta tag. See [LOCAL_SEO.md](LOCAL_SEO.md).
- **Cloudflare Turnstile** for the contact form: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`. The form already
  uses a honeypot, a minimum fill time and rate limiting without it.
