import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  Palette,
  Star,
  CheckCircle2,
  Store,
} from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";

export const revalidate = 60; // revalidate every minute

export default async function HomePage() {
  // Fetch featured products, categories, stores, reviews
  const [categories, featuredProducts, stores, reviews] = await Promise.all([
    prisma.category.findMany({
      where: { featured: true },
      take: 8,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      take: 8,
      include: {
        category: true,
        store: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.store.findMany({
      where: { featured: true },
      take: 4,
      include: {
        products: {
          take: 3,
          include: { images: true },
        },
      },
    }),
    prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (Editorial & Warm Reference 2 & 3 style) */}
      <section className="relative pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#f8eee7] via-[#faf4ee] to-[#f2dfd5] border border-brand-clay/80 p-8 sm:p-14 lg:p-20 overflow-hidden shadow-card">
          {/* Subtle Organic Background Blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-rose/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-sand/60 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-brand-clay shadow-subtle backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-brand-gold fill-brand-gold" />
                <span className="text-xs font-semibold tracking-wide uppercase text-brand-charcoal">
                  Handmade Happiness &amp; Honest Craft
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-charcoal leading-[1.12]">
                Where Every Creation Has a{" "}
                <span className="italic text-brand-terracotta underline decoration-brand-rose/60 decoration-wavy">
                  Human Story
                </span>
              </h1>

              <p className="text-base sm:text-lg text-brand-stone max-w-xl leading-relaxed">
                Discover tactile ceramics, botanical fine jewelry, clean wooden-wick candles, and inspiring DIY craft kits made with intention by independent creators.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/marketplace"
                  className="btn-primary text-sm px-8 py-4 shadow-clay hover:scale-[1.02] transition-transform"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/stores"
                  className="btn-secondary text-sm px-7 py-4 hover:border-brand-stone/40"
                >
                  <Store className="w-4 h-4 text-brand-terracotta" />
                  <span>Meet the Artisans</span>
                </Link>
              </div>

              {/* Feature Badges (Reference 2 style) */}
              <div className="pt-8 border-t border-brand-clay/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-brand-charcoal">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-subtle shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-brand-sage" />
                  </div>
                  <span>100% Handmade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-subtle shrink-0">
                    <Heart className="w-4 h-4 text-brand-terracotta" />
                  </div>
                  <span>Women-Led Brands</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-subtle shrink-0">
                    <Truck className="w-4 h-4 text-brand-gold" />
                  </div>
                  <span>Plastic-Free Ship</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-subtle shrink-0">
                    <ShieldCheck className="w-4 h-4 text-brand-sage" />
                  </div>
                  <span>Artisan Guarantee</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
                  alt="Artisan ceramic mug and morning sunshine"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-sand">
                    Maker Spotlight
                  </span>
                  <h3 className="font-serif text-xl font-bold mt-1">
                    Meera Patel • Mitti Ceramics
                  </h3>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                    Hand-thrown stoneware celebrating slow mornings and earthy textures.
                  </p>
                </div>
              </div>

              {/* Floating Pill Card (Reference 1 & 4 style) */}
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-white rounded-2xl p-4 shadow-elevated border border-brand-clay flex items-center gap-3 backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-brand-blush flex items-center justify-center text-brand-terracotta font-bold text-lg font-serif">
                  ✨
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal">Direct to Creator</p>
                  <p className="text-[11px] text-brand-stone">90%+ proceeds go to the maker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CIRCULAR CATEGORY BROWSER (Reference 2 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
              Browse by Craft
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-xs font-semibold text-brand-stone hover:text-brand-terracotta flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-white/80 transition-colors"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-brand-sand border-2 border-brand-clay group-hover:border-brand-terracotta group-hover:scale-105 shadow-subtle transition-all duration-300">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
              </div>
              <span className="text-xs font-semibold text-brand-charcoal mt-3 group-hover:text-brand-terracotta transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS GRID (Reference 2 & 3 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
              Curated Finds
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal mt-1">
              Customer Favorites &amp; New Arrivals
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="btn-outline text-xs"
          >
            Explore All ({featuredProducts.length}+)
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, idx) => {
            const badges = ["Bestseller", "New", "Staff Pick", "Trending"];
            const colors: ("terracotta" | "sage" | "gold" | "rose")[] = [
              "terracotta",
              "sage",
              "gold",
              "rose",
            ];
            const badge = badges[idx % badges.length];
            const badgeColor = colors[idx % colors.length];

            return (
              <ProductCard
                key={product.id}
                product={product}
                badge={badge}
                badgeColor={badgeColor}
              />
            );
          })}
        </div>
      </section>

      {/* 4. EDITORIAL MAKER INSPIRATION BANNER (Reference 2 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl sm:rounded-4xl bg-gradient-to-r from-brand-sage-light via-[#eaf0ec] to-[#f4eee6] border border-brand-clay/80 p-8 sm:p-14 overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-sage">
              Mindful Craftsmanship
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal leading-tight">
              Inspiration Lives Here
            </h2>
            <p className="text-sm sm:text-base text-brand-stone leading-relaxed">
              We connect conscious patrons with makers who spend hours shaping clay, dyeing organic linen, blending botanical oils, and cutting sparkling gemstones. No mass factory production. Just heart, hands, and heirloom intention.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/maker-stories"
                className="btn-primary bg-brand-sage hover:bg-brand-sage-dark text-xs px-6 py-3"
              >
                Read Maker Stories
              </Link>
              <Link
                href="/marketplace?category=diy-craft-kits"
                className="btn-secondary text-xs px-6 py-3"
              >
                Try a DIY Workshop Kit
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80"
                alt="Potter hands shaping wet clay"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md mt-6">
              <Image
                src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80"
                alt="Embroidery hoop and colorful floss"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. INDEPENDENT STOREFRONTS DIRECTORY (Reference 3 & 4 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
              Independent Brands
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal mt-1">
              Meet Our Featured Studios
            </h2>
          </div>
          <Link
            href="/stores"
            className="text-xs font-semibold text-brand-stone hover:text-brand-terracotta flex items-center gap-1 group"
          >
            <span>Explore All Stores</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/store/${store.slug}`}
              className="group bg-white rounded-3xl border border-brand-clay/70 p-5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-brand-sand mb-4">
                  {store.bannerUrl && (
                    <Image
                      src={store.bannerUrl}
                      alt={store.storeName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="absolute -bottom-3 left-4 w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md bg-white">
                    {store.logoUrl && (
                      <Image
                        src={store.logoUrl}
                        alt={store.storeName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-terracotta transition-colors">
                      {store.storeName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold text-brand-charcoal">
                      <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                      <span>{store.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-terracotta font-medium mt-0.5">
                    {store.location || "Independent Studio"}
                  </p>
                  <p className="text-xs text-brand-stone mt-2 line-clamp-2 leading-relaxed">
                    {store.tagline || store.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-brand-clay/40 flex items-center justify-between text-xs font-medium text-brand-stone">
                <span>{store.products.length} artisanal products</span>
                <span className="text-brand-terracotta group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Visit Store &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY REVIEWS ("What Our Makers Say" Reference 2 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
            Real Experiences
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal mt-1">
            What Our Community Says
          </h2>
          <p className="text-xs sm:text-sm text-brand-stone mt-2">
            Real people, real creativity, genuine handmade love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-brand-clay/70 p-6 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <h4 className="font-serif font-bold text-brand-charcoal text-sm mb-2">
                  &ldquo;{rev.title}&rdquo;
                </h4>
                <p className="text-xs text-brand-stone leading-relaxed">
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-brand-clay/40">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-brand-sand shrink-0">
                  {rev.userAvatar ? (
                    <Image
                      src={rev.userAvatar}
                      alt={rev.userName || "Customer"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-bold text-xs">
                      {rev.userName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal">{rev.userName}</p>
                  <p className="text-[10px] text-brand-sage font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Buyer</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SELLER CALL-TO-ACTION (Onboarding invite) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl sm:rounded-4xl bg-brand-charcoal text-white p-8 sm:p-14 overflow-hidden relative shadow-elevated">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-terracotta/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-terracotta text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For Creative Entrepreneurs</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Turn Your Craft Into a Thriving Business
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Are you an artisan, boutique designer, or handmade creator? Join Mitti &amp; Muse to launch your own personalized storefront in minutes, accept orders, and share your craftsmanship with a dedicated audience.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/auth/register?role=seller"
                className="btn-primary bg-white text-brand-charcoal hover:bg-brand-sand text-xs px-8 py-3.5 font-bold"
              >
                Launch Your Free Storefront
              </Link>
              <Link
                href="/seller/dashboard"
                className="px-6 py-3.5 rounded-full border border-stone-600 text-stone-200 hover:text-white text-xs font-medium"
              >
                Explore Seller Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
