# Mitti & Muse — Premium Digital Platform for Independent Businesses & Creative Artisans

A production-minded, multi-vendor web platform built specifically for boutique entrepreneurs, women-led small businesses, handmade product creators, ceramicists, jewelry makers, and local brands.

---

## 🎨 Visual Design System (Inspired by Attached References)

The visual language of **Mitti & Muse** directly translates the 4 reference designs into an editorial, tactile, and warm artisanal experience:

1. **Claymorphic & Tactile Depth** (*Reference 1 & 4*):
   - Soft embossed card surfaces (`rounded-3xl`, `shadow-soft`, `shadow-clay`).
   - Tactile pill badges, organic curves, and calm topographic dashboard metrics.
   - Warm color palette: Linen/Cream canvas (`#FAF7F2`), Terracotta (`#C86D51`), Eucalyptus Sage (`#5E8773`), Blush (`#F6ECE6`), and Deep Charcoal (`#28231F`).
2. **Editorial Marketplace Architecture** (*Reference 2 — MakerBloom*):
   - Warm announcement banner with free shipping threshold bar and community values.
   - Dual-action editorial hero section with high-resolution studio photography.
   - Circular "Shop by Category" avatar browser.
   - Clean product cards with ratings, collection tags, wishlist toggle, and instant Add-to-Cart.
   - "Inspiration Lives Here" maker journal and "What Our Community Says" customer reviews with verified buyer badges.
3. **Boutique Luxury Storefronts** (*Reference 3 — Lumina*):
   - Dedicated seller storefronts (`/store/[slug]`) with customized banners, artisan logos, craftsmanship ethics, and curated collections.
   - Direct maker enquiry modal for custom commissions and personalized gifting.
4. **Authentic Maker Analytics** (*Reference 4*):
   - Non-fabricated dashboard metrics calculated directly from database records (actual revenue in minor currency units, real order counts, and low-stock alerts).

---

## 🚀 Key Implemented Features

### 🛒 1. Customer Commerce Journey
- **Marketplace & Discovery (`/marketplace`)**: Real-time keyword search, craft category pills, price range filtering, sort order (featured, newest, price low-to-high, price high-to-low), and artisan studio filters.
- **Product Detail (`/product/[slug]`)**: Multi-angle image gallery, dynamic option variant selection (size, metal finish, scent) with automatic price adjustments, live stock indicators, craftsmanship specifications, and direct maker commission enquiry modal.
- **Persistent Shopping Basket (`/cart` & Slideover Drawer)**: Real-time quantity adjustments, free shipping progress meter ($50 threshold), coupon code system (`MAKER10` for 10% discount).
- **Authoritative Multi-Step Checkout (`/checkout`)**: Server-side re-verification of product prices and stock levels (frontend totals are never trusted). Atomic transaction prevents overselling. Functional test-card sandbox mode.
- **Order Tracking & Confirmation (`/order-confirmation/[orderId]` & `/account/orders`)**: Multi-vendor itemized receipt displaying which artisan studio is fulfilling each item, current fulfillment status, and courier tracking details.
- **Saved Wishlist (`/account/wishlist`)**: Persistent saved favorites with one-click basket transfer.

### 🏺 2. Seller Studio Portal (`/seller/dashboard`)
- **Authentic Metrics Dashboard**: Revenue calculated from actual order records, total order volume, pending fulfillment shipments, and low-stock inventory warnings.
- **Product Catalog Management (`/seller/products`)**: Inline stock adjustments, status toggles (`ACTIVE` vs `DRAFT`), and deletion.
- **New Product Publisher (`/seller/products/new`)**: Rich creation form with variants (size, options, price deltas, stock), craftsmanship notes, care instructions, image presets, and category mapping.
- **Multi-Vendor Order Fulfillment (`/seller/orders`)**: Isolated seller order items with transition controls (`PENDING` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`), courier selection (USPS, FedEx, UPS, DHL), and tracking numbers.
- **Storefront Customizer (`/seller/storefront`)**: Edit store name, tagline, location, banner cover, logo avatar, craftsmanship ethics, maker story, and policies.
- **Custom Commissions & Enquiries (`/seller/enquiries`)**: Read and respond to customer requests and personalized orders.

---

## 🛠 Technology Stack

- **Framework**: Next.js 15 (App Router with Server Components & Route Handlers)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom claymorphic utilities & responsive breakpoints
- **Database**: SQLite (via Prisma ORM 6), portable and zero-setup, easily switchable to PostgreSQL via Prisma schema
- **Authentication**: JWT tokens in secure HttpOnly cookies + bcrypt password hashing
- **State Management**: React Context (`AuthContext`, `CartContext`, `WishlistContext`)

---

## 🔑 Demonstration Accounts

You can log in instantly using the **One-Click Demo Login** buttons on `/auth/login`:

| Role | Name | Email | Password | Storefront |
|---|---|---|---|---|
| **Artisan Seller** | Meera Patel | `meera@mitticeramics.com` | `Password123!` | [Mitti Ceramics](/store/mitti-ceramics) |
| **Artisan Seller** | Aisha & Zoya Rao | `aisha@aurajewels.com` | `Password123!` | [Aura Botanical Jewels](/store/aura-jewels) |
| **Artisan Seller** | Elena Chen | `elena@botanicawick.com` | `Password123!` | [Botanica & Wick](/store/botanica-wick) |
| **Artisan Seller** | Chloe & Liam | `chloe@makerbloom.com` | `Password123!` | [MakerBloom Studio](/store/makerbloom-crafts) |
| **Customer** | Priya Sharma | `priya@example.com` | `Password123!` | *Patron* |
| **Admin** | Curator | `admin@mittimuse.com` | `Password123!` | *Platform Admin* |

---

## 💻 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database & Seed Demo Artisans
```bash
npx prisma db push
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Workflows & Data Isolation Tests
```bash
node scripts/test-workflows.mjs
```
# artisan-marketplace
