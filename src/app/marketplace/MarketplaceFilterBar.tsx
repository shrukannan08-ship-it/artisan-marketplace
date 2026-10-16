"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { Category, Store } from "@/types";

interface FilterBarProps {
  categories: Category[];
  stores: Store[];
  currentQuery: string;
  currentCategory: string;
  currentStore: string;
  currentSort: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  totalProducts: number;
}

export default function MarketplaceFilterBar({
  categories,
  stores,
  currentQuery,
  currentCategory,
  currentStore,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  totalProducts,
}: FilterBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentQuery);

  const updateFilters = (params: Record<string, string | undefined>) => {
    const url = new URL(window.location.href);

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    router.push(url.pathname + url.search);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search.trim() || undefined });
  };

  const clearAllFilters = () => {
    setSearch("");
    router.push("/marketplace");
  };

  const hasActiveFilters = Boolean(
    currentQuery || currentCategory || currentStore || currentMinPrice || currentMaxPrice || currentSort !== "featured"
  );

  return (
    <div className="space-y-4 bg-white rounded-3xl p-6 border border-brand-clay/70 shadow-soft">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, materials (e.g. ceramic, pearl, soy)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-brand-cream/60 rounded-full border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/40"
          />
          <Search className="w-4 h-4 text-brand-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Store & Sort Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
          {/* Store Filter */}
          <select
            value={currentStore}
            onChange={(e) => updateFilters({ store: e.target.value || undefined })}
            className="px-4 py-2 text-xs font-medium rounded-full bg-brand-cream/60 border border-brand-clay focus:outline-none text-brand-charcoal"
          >
            <option value="">All Artisan Studios</option>
            {stores.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.storeName}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-brand-cream/60 border border-brand-clay text-xs font-medium text-brand-charcoal">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-stone" />
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-transparent focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Pills (Reference 2 style) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
        <button
          onClick={() => updateFilters({ category: undefined })}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            !currentCategory
              ? "bg-brand-terracotta text-white shadow-xs"
              : "bg-brand-cream border border-brand-clay text-brand-stone hover:text-brand-charcoal hover:bg-white"
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              updateFilters({
                category: currentCategory === cat.slug ? undefined : cat.slug,
              })
            }
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              currentCategory === cat.slug
                ? "bg-brand-terracotta text-white shadow-xs"
                : "bg-brand-cream border border-brand-clay text-brand-stone hover:text-brand-charcoal hover:bg-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Result Count Status */}
      <div className="pt-2 border-t border-brand-clay/30 flex items-center justify-between text-xs text-brand-stone">
        <span>
          Showing <strong className="text-brand-charcoal">{totalProducts}</strong> handcrafted pieces
        </span>
        {currentCategory && (
          <span className="text-brand-terracotta font-medium">
            Category: {categories.find((c) => c.slug === currentCategory)?.name}
          </span>
        )}
      </div>
    </div>
  );
}
