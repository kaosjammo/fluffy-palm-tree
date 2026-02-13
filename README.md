# Snapframe

Snapframe is a minimal SaaS MVP that turns raw screenshots into polished mockups in seconds.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + Postgres
- Supabase Auth (email magic link + Google OAuth)
- Stripe subscriptions ($15/mo Pro)
- Vercel-ready deploy

## MVP Scope Included

- Public pages: `/`, `/pricing`
- Auth page: `/login`
- App dashboard: `/app` with upload + style controls + live preview
- Account page: `/account` with Stripe actions
- Server routes for:
  - Export rendering with server-side plan gating
  - Pro-only preset save enforcement
  - Stripe checkout, billing portal, and webhook syncing

## Plan Rules

### Free
- Watermark on export
- 5 exports per day
- No saved presets
- 1080p max

### Pro ($15/mo)
- Unlimited exports
- No watermark
- Saved presets
- 4K export

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/snapframe"

   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PRICE_ID_PRO="price_..."

   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. Run Prisma migrations + generate client:
   ```bash
   npm run db:migrate
   npm run db:generate
   ```
4. Seed demo data:
   ```bash
   npm run db:seed
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```

## Export Verification (Dev)

Use the verification script to confirm rendering + plan behavior locally.

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Run the verification script:
   ```bash
   npm run verify:export
   ```
3. Expected result:
   - Script exits successfully.
   - Free render is within 1920x1080 and includes watermark.
   - Pro render is within 3840x2160 and has no watermark.
   - Script compares bottom watermark-area pixels between Free and Pro outputs.

## Stripe Webhook Local Testing

1. Start the app:
   ```bash
   npm run dev
   ```
2. In another shell, forward Stripe events to local webhook:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Trigger checkout from the app (POST to `/api/stripe/checkout`) and complete payment using Stripe test card `4242 4242 4242 4242`.
4. Confirm user billing state updated to Pro:
   ```bash
   npm run billing:state -- --email <your-authenticated-email>
   ```
5. Cancel subscription in Stripe test dashboard or billing portal, then trigger/update webhook events and confirm state returns to Free:
   ```bash
   npm run billing:state -- --email <your-authenticated-email>
   ```

Expected webhook behavior:
- `checkout.session.completed` links customer/subscription to app user.
- `customer.subscription.created` and `customer.subscription.updated` set status/period/plan.
- `customer.subscription.deleted` downgrades plan to Free.
- Duplicate successfully-processed webhook deliveries are ignored; failed events are retried.

## Manual QA Checklist

- [ ] Sign in as a Free user and export 5 times from `/app`; 6th attempt returns a clear limit message.
- [ ] Free export downloads PNG with watermark footer and output dimensions capped at 1080p.
- [ ] Upgrade to Pro in Stripe test checkout and confirm account plan updates to PRO automatically.
- [ ] Cancel Stripe subscription and confirm account plan returns to FREE automatically.
- [ ] Exported style settings (padding/background/frame/shadow/radius) in downloaded image match the editor preview styling.
- [ ] Confirm `Export` records are written with `userId`, `createdAt`, `width`, `height`, `watermarkApplied`, and `planAtTime`.

## Stripe Notes

- `/api/stripe/checkout` creates a subscription checkout session for Pro.
- `/api/stripe/portal` sends existing paying users to the billing portal.
- `/api/stripe/webhook` verifies Stripe signatures and syncs billing fields/plan.
- Users are automatically provisioned into Prisma on first authenticated server session (`supabaseUserId` + `email`).
- `npm run billing:state -- --email <email>` prints billing state and last webhook processing info.

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import into Vercel.
3. Set all environment variables.
4. Configure Postgres + Supabase + Stripe production keys.
5. Run Prisma migrations in deploy pipeline.

## Seed Script

Seed file lives at:

- `prisma/seed.ts`

It creates a default demo user:

- `demo@snapframe.app` (Free plan)
