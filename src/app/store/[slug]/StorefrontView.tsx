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
      {/* 1. STOREFRONT HERO & BANNER (Reference 3 & 2 style) */}
      <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden shadow-card border border-brand-clay/80 bg-white">
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
          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 via-black/20 to-transparent" />

          {/* Share Button on Top Right */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-brand-charcoal hover:bg-white shadow-subtle flex items-center gap-1.5 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand-sage" />
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
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-elevated bg-white shrink-0">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.storeName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-terracotta text-white flex items-center justify-center font-serif text-3xl font-bold">
                  {store.storeName.charAt(0)}
                </div>
              )}
            </div>

            {/* Title & Stats */}
            <div className="space-y-1 sm:mb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
                  {store.storeName}
                </h1>
                <span className="p-1 rounded-full bg-brand-sage/20 text-brand-sage" title="Verified Independent Artisan">
                  <Sparkles className="w-4 h-4 fill-brand-sage" />
                </span>
              </div>

              {store.tagline && (
                <p className="text-xs sm:text-sm font-medium text-brand-stone max-w-lg">
                  {store.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-brand-stone pt-1">
                {store.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-terracotta" />
                    <span>{store.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-brand-charcoal font-semibold">
                  <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-brand-stone font-normal">({store.reviewCount} reviews)</span>
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
              className="btn-primary text-xs px-6 py-3 shadow-clay w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Artisan / Custom Request</span>
            </button>
          </div>
        </div>

        {/* Store Navigation Tabs (Reference 3 style) */}
        <div className="flex items-center gap-8 px-6 sm:px-10 border-t border-brand-clay/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "products"
                ? "border-brand-terracotta text-brand-terracotta"
                : "border-transparent text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Artisan Catalog ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`py-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "story"
                ? "border-brand-terracotta text-brand-terracotta"
                : "border-transparent text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maker&apos;s Story &amp; Values</span>
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`py-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "policies"
                ? "border-brand-terracotta text-brand-terracotta"
                : "border-transparent text-brand-stone hover:text-brand-charcoal"
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
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-brand-terracotta text-white shadow-xs"
                    : "bg-white border border-brand-clay text-brand-stone hover:text-brand-charcoal"
                }`}
              >
                All Products ({products.length})
              </button>
              {storeCategories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedCategory === catName
                      ? "bg-brand-terracotta text-white shadow-xs"
                      : "bg-white border border-brand-clay text-brand-stone hover:text-brand-charcoal"
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}

          {/* Store Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-brand-clay p-8">
              <p className="text-sm text-brand-stone">No products available in this category.</p>
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
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-8 sm:p-12 shadow-soft space-y-8 max-w-4xl mx-auto">
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
            <div className="p-6 rounded-2xl bg-brand-cream/80 border border-brand-clay/60 space-y-2">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                Craftsmanship &amp; Material Ethics
              </h3>
              <p className="text-xs sm:text-sm text-brand-stone leading-relaxed">
                {store.craftsmanship}
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-brand-clay/50 flex items-center justify-between">
            <span className="text-xs text-brand-stone">Interested in a custom project?</span>
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="btn-primary text-xs px-6 py-2.5"
            >
              Send Custom Commission
            </button>
          </div>
        </div>
      )}

      {activeTab === "policies" && (
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-8 sm:p-12 shadow-soft space-y-8 max-w-4xl mx-auto">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Store Commitments
            </span>
            <h2 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
              Shipping &amp; Return Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-brand-cream/60 border border-brand-clay/60 space-y-3">
              <div className="flex items-center gap-2 text-brand-charcoal font-bold text-sm">
                <Truck className="w-5 h-5 text-brand-terracotta" />
                <span>Shipping Policy</span>
              </div>
              <p className="text-xs text-brand-stone leading-relaxed">
                {store.policyShipping || "Orders are packaged in eco-friendly honeycomb wrap and dispatched within 2-3 business days with tracked delivery."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-cream/60 border border-brand-clay/60 space-y-3">
              <div className="flex items-center gap-2 text-brand-charcoal font-bold text-sm">
                <RotateCcw className="w-5 h-5 text-brand-sage" />
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
