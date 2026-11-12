"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Instagram,
  MessageCircle,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Share2,
  Check,
} from "lucide-react";
import { Store, Product } from "@/types";
import ProductCard from "@/components/ui/ProductCard";
import CustomEnquiryModal from "@/components/store/CustomEnquiryModal";

interface StorefrontViewProps {
  store: Store;
  products: Product[];
}

export default function StorefrontView({ store, products }: StorefrontViewProps) {
  const [activeTab, setActiveTab] = useState<"products" | "story" | "policies">("products");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Extract unique categories in this store
  const storeCategories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ) as string[];

  const filteredProducts =
    selectedCategory === "ALL"
      ? products
      : products.filter((p) => p.category?.name === selectedCategory);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. STOREFRONT HERO & BANNER */}
      <div className="relative clay-card rounded-[32px] sm:rounded-[36px] overflow-hidden bg-white">
        {/* Banner Cover */}
        <div className="relative h-60 sm:h-80 w-full bg-brand-sand">
          {store.bannerUrl && (
            <Image
              src={store.bannerUrl}
              alt={store.storeName}
              fill
              priority
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-black/25 to-transparent" />

          {/* Share Button on Top Right */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 px-4 py-2 rounded-full clay-pill text-xs font-bold text-brand-charcoal hover:shadow-clay-card flex items-center gap-1.5 transition-all bg-white/95"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-brand-stone" />
                <span>Share Storefront</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Card Overlay */}
        <div className="px-6 sm:px-10 pb-8 pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Logo Avatar */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden clay-card p-1 bg-white border-2 border-white/90 shrink-0">
              <div className="relative w-full h-full rounded-[22px] overflow-hidden">
                {store.logoUrl ? (
                  <Image
                    src={store.logoUrl}
                    alt={store.storeName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-terracotta to-brand-rust text-white flex items-center justify-center font-serif text-3xl font-bold">
                    {store.storeName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Title & Stats */}
            <div className="space-y-1 sm:mb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal tracking-tight">
                  {store.storeName}
                </h1>
                <span className="p-1 rounded-full bg-brand-mint text-emerald-800 shadow-xs" title="Verified Independent Artisan">
                  <Sparkles className="w-4 h-4 fill-emerald-700" />
                </span>
              </div>

              {store.tagline && (
                <p className="text-xs sm:text-sm font-medium text-brand-stone max-w-lg">
                  {store.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-stone pt-1">
                {store.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>{store.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-brand-charcoal bg-brand-cream/80 px-2.5 py-0.5 rounded-full border border-brand-clay/40 shadow-xs">
                  <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-brand-stone font-normal text-[11px]">({store.reviewCount} reviews)</span>
                </span>
                {store.instagram && (
                  <a
                    href={`https://instagram.com/${store.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-stone hover:text-brand-terracotta transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>{store.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Button: Custom Request / Contact */}
          <div className="sm:mb-2 flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="clay-pill-btn text-xs px-6 py-3 text-white font-bold w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Artisan / Custom Request</span>
            </button>
          </div>
        </div>

        {/* Store Navigation Tabs (Tactile clay buttons) */}
        <div className="flex items-center gap-3 px-6 sm:px-10 py-3.5 border-t border-brand-clay/30 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "products"
                ? "clay-pill-btn text-white"
                : "clay-pill text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Artisan Catalog ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "story"
                ? "clay-pill-btn text-white"
                : "clay-pill text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maker&apos;s Story &amp; Values</span>
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "policies"
                ? "clay-pill-btn text-white"
                : "clay-pill text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Shipping &amp; Policies</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENTS */}
      {activeTab === "products" && (
        <div className="space-y-8">
          {/* Category Filter Chips for this Store */}
          {storeCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === "ALL"
                    ? "clay-pill-btn text-white"
                    : "clay-pill text-brand-stone hover:text-brand-charcoal"
                }`}
              >
                All Products ({products.length})
              </button>
              {storeCategories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === catName
                      ? "clay-pill-btn text-white"
                      : "clay-pill text-brand-stone hover:text-brand-charcoal"
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}

          {/* Store Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 clay-card rounded-[32px] p-8 max-w-md mx-auto space-y-2 bg-white">
              <p className="font-serif text-lg font-bold text-brand-charcoal">Catalog Empty</p>
              <p className="text-xs text-brand-stone">No products available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "story" && (
        <div className="clay-card rounded-[32px] p-8 sm:p-12 space-y-8 max-w-4xl mx-auto bg-white">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Behind The Craft
            </span>
            <h2 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
              The Story of {store.storeName}
            </h2>
          </div>

          <p className="text-base text-brand-stone leading-relaxed whitespace-pre-line">
            {store.story || store.description || "The artisan is currently composing their studio journey."}
          </p>

          {store.craftsmanship && (
            <div className="p-6 rounded-2xl clay-card bg-brand-cream/80 space-y-2">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                Craftsmanship &amp; Material Ethics
              </h3>
              <p className="text-xs sm:text-sm text-brand-stone leading-relaxed">
                {store.craftsmanship}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-brand-clay/30 flex items-center justify-between">
            <span className="text-xs text-brand-stone">Interested in a custom project?</span>
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="clay-pill-btn text-xs px-6 py-2.5 text-white font-bold"
            >
              Send Custom Commission
            </button>
          </div>
        </div>
      )}

      {activeTab === "policies" && (
        <div className="clay-card rounded-[32px] p-8 sm:p-12 space-y-8 max-w-4xl mx-auto bg-white">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Store Commitments
            </span>
            <h2 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
              Shipping &amp; Return Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl clay-card bg-brand-cream/60 space-y-3">
              <div className="flex items-center gap-2 text-brand-charcoal font-bold text-sm">
                <Truck className="w-5 h-5 text-brand-terracotta" />
                <span>Shipping Policy</span>
              </div>
              <p className="text-xs text-brand-stone leading-relaxed">
                {store.policyShipping || "Orders are packaged in eco-friendly honeycomb wrap and dispatched within 2-3 business days with tracked delivery."}
              </p>
            </div>

            <div className="p-6 rounded-2xl clay-card bg-brand-cream/60 space-y-3">
              <div className="flex items-center gap-2 text-brand-charcoal font-bold text-sm">
                <RotateCcw className="w-5 h-5 text-emerald-700" />
                <span>Returns &amp; Exchanges</span>
              </div>
              <p className="text-xs text-brand-stone leading-relaxed">
                {store.policyReturns || "We want you to love your handmade pieces! Returns accepted within 14 days of receipt for unused items in original packaging."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Enquiry Modal */}
      <CustomEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        storeId={store.id}
        storeName={store.storeName}
      />
    </div>
  );
}
