# Mitti & Muse — Multi-Vendor Artisan Marketplace Platform

A full-stack multi-vendor marketplace built for independent businesses, handmade creators, and boutique entrepreneurs, powered by **Next.js 15 (App Router)** and **Supabase** (Auth, PostgreSQL, Row Level Security, Storage, RPCs, and Edge Functions).

---

## Architecture Overview

- **Frontend & SSR (`src/app`, `src/components`, `src/context`)**
  - Next.js 15 App Router with React 19, TypeScript, Tailwind CSS, and Lucide icons.
  - Customer journeys: marketplace browsing & filtering (`/marketplace`), artisan storefronts (`/stores`, `/store/[slug]`), product detail pages (`/product/[slug]`), maker stories (`/maker-stories`), cart & checkout (`/cart`, `/checkout`), order receipts (`/order-confirmation/[orderId]`), order history (`/account/orders`), and wishlist (`/account/wishlist`).
  - Owner/Seller Studio (`/seller/*`): dashboard metrics (`/seller/dashboard`), storefront branding (`/seller/storefront`), product & variant publishing (`/seller/products`, `/seller/products/new`), order management (`/seller/orders`), and custom enquiries (`/seller/enquiries`).
  - Admin Console (`/admin`): platform-wide moderation for stores, products, and user roles.
- **Supabase Data & Security (`supabase/`)**
  - **Schema & Triggers (`supabase/migrations/20261112000001_initial_schema.sql`)**: PostgreSQL tables (`profiles`, `stores`, `categories`, `products`, `orders`, `order_items`, `enquiries`, `wishlist_items`) and `handle_new_user()` profile trigger.
  - **Row Level Security (`supabase/migrations/20261112000002_rls_policies.sql`)**: Role-based and ownership-based policies with `SECURITY DEFINER` helpers (`is_order_owner`, `order_has_vendor_store`) to avoid mutual policy recursion.
  - **Storage & RPCs (`supabase/migrations/20261112000003_storage_and_rpcs.sql`)**: `product-images` and `store-assets` Storage buckets plus PostgreSQL RPCs (`create_order`, `get_order_receipt`, `get_seller_stats`).
  - **Category Seed (`supabase/seed.sql`)**: Initial marketplace category taxonomy (no fake products, sellers, or orders).
  - **Edge Functions (`supabase/functions/`)**:
    - `create-order` — server-side validated multi-vendor order creation
    - `admin-actions` — privileged admin store/product/role moderation
    - `enquiry-notify` — customer custom-enquiry processing
    - `_shared/cors.ts` — shared CORS helper
- **Server & API Layer (`src/lib/supabase/`, `src/app/api/`, `src/middleware.ts`)**
  - `@supabase/ssr` + `@supabase/supabase-js` session management for Server Components, Route Handlers, and browser clients.
  - Customer, Seller/Owner, and Admin authentication flows (`/auth/customer/*`, `/auth/owner/*`, `/auth/login`, `/auth/register`, `/auth/reset-password`, `/auth/callback`).

> **Note on Pre-Cutover Local Fallback:** When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not configured (`!isSupabaseConfigured()`), the server layer retains a Prisma + SQLite (`prisma/dev.db`) + JWT compatibility fallback so local development and workflow tests continue working until Supabase credentials are supplied.

---

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` (which is gitignored via `.env*.local`) and provide your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

NEXT_PUBLIC_APP_NAME="Mitti & Muse"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_CURRENCY="INR"
NEXT_PUBLIC_CURRENCY_SYMBOL="₹"
```

> Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` in client components (`NEXT_PUBLIC_*`).

### 3. Apply Supabase Migrations, Seed & Edge Functions

Using the Supabase CLI (or the Supabase SQL Editor):

```bash
# Push schema, RLS policies, storage buckets, and RPCs
supabase db push

# Or run the SQL files in order:
# 1. supabase/migrations/20261112000001_initial_schema.sql
# 2. supabase/migrations/20261112000002_rls_policies.sql
# 3. supabase/migrations/20261112000003_storage_and_rpcs.sql
# 4. supabase/seed.sql

# Deploy Edge Functions
supabase functions deploy create-order
supabase functions deploy admin-actions
supabase functions deploy enquiry-notify
```

### 4. Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`. There are no preloaded fake accounts or products—register a Customer or Business Owner account via `/auth/register` (or `/auth/customer/register` and `/auth/owner/register`) to start using the marketplace.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production Next.js bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |
| `npm test` | Run end-to-end API workflow tests (`scripts/test-workflows.mjs`) against the local fallback |
| `npm run test:supabase` | Run Supabase migration, RLS, RPC, Edge Function & bundle security verification (`scripts/test-supabase-migration.mjs`) |
