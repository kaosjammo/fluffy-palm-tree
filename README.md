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
  - Export creation with server-side plan gating
  - Pro-only preset save enforcement
  - Stripe checkout and billing portal session creation

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

## Stripe Notes

- `/api/stripe/checkout` creates a subscription checkout session for Pro.
- `/api/stripe/portal` sends existing paying users to the billing portal.

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
