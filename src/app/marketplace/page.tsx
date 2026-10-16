import React from "react";
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
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-clay/70 p-8 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-blush flex items-center justify-center mx-auto text-2xl mb-4">
            🔍
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            No artisan creations found
          </h3>
          <p className="text-sm text-brand-stone max-w-md mx-auto mt-2">
            Try adjusting your search query, clearing filters, or browsing other craft categories.
          </p>
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
