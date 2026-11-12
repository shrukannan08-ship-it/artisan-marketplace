import React from "react";
import Link from "next/link";
import { Sparkles, Store, RefreshCw } from "lucide-react";
import { getMarketplaceData } from "@/lib/marketplace-queries";
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

  const { products, categories, stores } = await getMarketplaceData({
    q,
    category,
    store,
    sort,
    minPrice,
    maxPrice,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner Plate */}
      <div className="relative clay-card rounded-[32px] p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-white via-brand-bisque/90 to-brand-peach/15">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-brand-butter text-brand-charcoal shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Curated Independent Crafts</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal tracking-tight">
            Marketplace &amp; Discovery
          </h1>
          <p className="text-xs sm:text-sm text-brand-stone max-w-xl leading-relaxed">
            Discover unique small-batch creations made with patience, sustainable ingredients, and artisanal heritage by verified independent creators.
          </p>
        </div>

        {/* Soft pastel decorative ambient plates */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-brand-mint/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-28 w-36 h-36 rounded-full bg-brand-peach/40 blur-2xl pointer-events-none" />
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
        <div className="text-center py-16 sm:py-20 clay-card rounded-[32px] p-8 sm:p-12 max-w-2xl mx-auto space-y-5">
          <div className="w-20 h-20 rounded-[28px] bg-brand-peach/60 border border-white/80 shadow-clay-card flex items-center justify-center mx-auto text-brand-terracotta">
            <Sparkles className="w-9 h-9" />
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
                  className="clay-pill px-5 py-2.5 text-xs font-bold text-brand-charcoal hover:shadow-clay-card inline-flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-brand-terracotta" />
                  <span>Clear All Filters</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-mint text-brand-charcoal shadow-xs">
                <Store className="w-3.5 h-3.5 text-emerald-800" />
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
                  className="clay-pill-btn text-xs px-6 py-3 text-white flex items-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Start Your Store &amp; Publish First Product</span>
                </Link>
                <Link
                  href="/auth/owner/login"
                  className="clay-pill text-xs px-5 py-3 font-bold text-brand-charcoal hover:shadow-clay-card"
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
