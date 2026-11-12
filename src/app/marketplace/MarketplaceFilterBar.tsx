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
    <div className="clay-card rounded-[28px] p-5 sm:p-6 space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search handcrafted goods, pottery, botanical jewelry, soy candles..."
            className="w-full pl-10 pr-4 py-2.5 text-xs text-brand-charcoal clay-input rounded-full placeholder:text-brand-stone/60 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
          />
          <Search className="w-4 h-4 text-brand-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Store & Sort Dropdowns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar">
          {/* Store Filter */}
          <select
            value={currentStore}
            onChange={(e) => updateFilters({ store: e.target.value || undefined })}
            className="px-3.5 py-2 text-xs font-semibold rounded-full clay-pill text-brand-charcoal focus:outline-none cursor-pointer"
          >
            <option value="">All Artisan Studios</option>
            {stores.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.storeName}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full clay-pill text-xs font-semibold text-brand-charcoal shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-stone" />
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-transparent focus:outline-none cursor-pointer"
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
              className="px-3.5 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/80 text-xs font-semibold flex items-center gap-1 shrink-0 transition-all shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Pills (Tactile Clay Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <button
          onClick={() => updateFilters({ category: undefined })}
          className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
            !currentCategory
              ? "clay-pill-btn text-white"
              : "clay-pill text-brand-stone hover:text-brand-charcoal hover:shadow-clay-card"
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() =>
                updateFilters({
                  category: isActive ? undefined : cat.slug,
                })
              }
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? "clay-pill-btn text-white"
                  : "clay-pill text-brand-stone hover:text-brand-charcoal hover:shadow-clay-card"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Result Count Status */}
      <div className="pt-3 border-t border-brand-clay/30 flex items-center justify-between text-xs text-brand-stone">
        <span>
          Showing <strong className="text-brand-charcoal font-bold">{totalProducts}</strong> handcrafted pieces
        </span>
        {currentCategory && (
          <span className="text-brand-terracotta font-bold">
            Category: {categories.find((c) => c.slug === currentCategory)?.name}
          </span>
        )}
      </div>
    </div>
  );
}
