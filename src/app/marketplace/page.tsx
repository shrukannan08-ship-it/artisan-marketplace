import React from "react";
import Link from "next/link";
import { Sparkles, Store, RefreshCw } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import MarketplaceFilterBar from "./MarketplaceFilterBar";

interface MarketplacePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    store?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const category = resolvedParams.category || "";
  const store = resolvedParams.store || "";
  const sort = resolvedParams.sort || "featured";
  const minPrice = resolvedParams.minPrice;
  const maxPrice = resolvedParams.maxPrice;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: "ACTIVE",
  };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (store) {
    where.store = { slug: store };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice) * 100;
    if (maxPrice) where.price.lte = parseInt(maxPrice) * 100;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-low") {
    orderBy = { price: "asc" };
  } else if (sort === "price-high") {
    orderBy = { price: "desc" };
  } else if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  }

  const [products, categories, stores] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        store: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.store.findMany({ orderBy: { storeName: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-blush via-white to-brand-sand rounded-3xl p-6 sm:p-10 border border-brand-clay/70 shadow-soft">
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
          Curated Independent Crafts
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal mt-1">
          Marketplace &amp; Discovery
        </h1>
        <p className="text-sm text-brand-stone max-w-xl mt-2">
          Discover unique small-batch creations made with patience, sustainable ingredients, and artisanal heritage.
        </p>
      </div>

      {/* Filter and Search Bar Component */}
      <MarketplaceFilterBar
        categories={categories}
        stores={stores}
        currentQuery={q}
        currentCategory={category}
        currentStore={store}
        currentSort={sort}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        totalProducts={products.length}
      />

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-brand-clay/70 p-8 shadow-soft max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-blush flex items-center justify-center mx-auto text-brand-terracotta">
            <Sparkles className="w-8 h-8" />
          </div>
          {q || category || store || minPrice || maxPrice ? (
            <>
              <h3 className="font-serif text-2xl font-bold text-brand-charcoal">
                No creations match your filter
              </h3>
              <p className="text-xs sm:text-sm text-brand-stone max-w-md mx-auto leading-relaxed">
                Try adjusting your search keywords, price boundaries, or clearing active filters to discover more items.
              </p>
              <div className="pt-2">
                <Link
                  href="/marketplace"
                  className="btn-outline text-xs px-5 py-2.5 inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-terracotta/10 text-brand-terracotta">
                <Store className="w-3.5 h-3.5" />
                <span>Makers Wanted</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
                The Marketplace Is Awakening
              </h3>
              <p className="text-xs sm:text-sm text-brand-stone max-w-md mx-auto leading-relaxed">
                All products on Mitti &amp; Muse are created and published directly by verified independent studio owners. No listings have been published yet.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/auth/owner/register"
                  className="btn-primary text-xs px-6 py-3 shadow-clay flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Start Your Store &amp; Publish First Product</span>
                </Link>
                <Link
                  href="/auth/owner/login"
                  className="btn-secondary text-xs px-5 py-3"
                >
                  <span>Owner Login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
