"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import CustomEnquiryModal from "@/components/store/CustomEnquiryModal";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(
    product.images?.find((img) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  const isFavorite = isInWishlist(product.id);

  // Calculate current price based on variant
  const currentPrice = product.price + (selectedVariant?.priceDelta || 0);
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-stone">
        <Link href="/" className="hover:text-brand-terracotta">
          Home
        </Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-brand-terracotta">
          Marketplace
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/marketplace?category=${product.category.slug}`}
              className="hover:text-brand-terracotta"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-brand-charcoal font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="clay-card rounded-[32px] p-2.5 sm:p-3 overflow-hidden bg-white">
            <div className="relative aspect-square w-full rounded-[26px] overflow-hidden bg-brand-sand/40">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                priority
                className="object-cover transition-all duration-300"
              />
              {product.featured && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-butter text-brand-charcoal shadow-clay-pill border border-white/90">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Curator&apos;s Pick</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-brand-sand/40 transition-all shrink-0 ${
                    selectedImage === img.url
                      ? "ring-2 ring-brand-terracotta scale-105 shadow-clay-card"
                      : "opacity-75 hover:opacity-100 border border-brand-clay/60 shadow-xs"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || product.title}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Store info strip */}
          {product.store && (
            <div className="clay-card rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
              <Link
                href={`/store/${product.store.slug}`}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-9 h-9 rounded-full bg-brand-sand overflow-hidden border border-brand-clay relative shadow-xs">
                  {product.store.logoUrl ? (
                    <Image
                      src={product.store.logoUrl}
                      alt={product.store.storeName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-brand-terracotta">
                      {product.store.storeName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal group-hover:text-brand-terracotta transition-colors">
                    {product.store.storeName}
                  </p>
                  <p className="text-[10px] text-brand-stone">
                    {product.store.location || "Independent Maker"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1 text-xs font-bold text-brand-charcoal bg-brand-cream/80 px-2.5 py-1 rounded-full border border-brand-clay/50 shadow-xs">
                <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                <span>{product.store.rating.toFixed(1)}</span>
                <span className="text-brand-stone text-[10px] font-normal">
                  ({product.store.reviewCount})
                </span>
              </div>
            </div>
          )}

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal leading-tight">
              {product.title}
            </h1>
            {product.category && (
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold bg-brand-butter/60 text-brand-charcoal border border-amber-200/60 shadow-xs">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
              {formatCurrency(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-base text-brand-stone line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-mint text-brand-charcoal shadow-xs">
              Taxes included
            </span>
          </div>

          <p className="text-xs sm:text-sm text-brand-stone leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                {product.variants[0]?.name || "Select Option"}:{" "}
                <span className="text-brand-terracotta normal-case font-bold">
                  {selectedVariant?.option}
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? "clay-pill-btn text-white"
                          : "clay-pill text-brand-charcoal hover:shadow-clay-card"
                      }`}
                    >
                      <span>{v.option}</span>
                      {v.priceDelta !== 0 && (
                        <span className="ml-1 opacity-90">
                          ({v.priceDelta > 0 ? "+" : ""}
                          {formatCurrency(v.priceDelta)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {availableStock > 0 ? (
              availableStock <= product.lowStockThreshold ? (
                <span className="text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 font-semibold shadow-xs">
                  ⚠️ Only {availableStock} handcrafted pieces left in stock!
                </span>
              ) : (
                <span className="text-emerald-800 bg-brand-mint/70 px-3.5 py-1 rounded-full border border-emerald-200/60 font-semibold shadow-xs">
                  ✓ In Stock &amp; Ready to Dispatch
                </span>
              )
            ) : (
              <span className="text-red-700 bg-red-50 px-3.5 py-1 rounded-full border border-red-200 font-semibold shadow-xs">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center clay-card rounded-full px-2.5 py-1 shadow-clay-card bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-charcoal"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-brand-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="w-7 h-7 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-charcoal"
                  disabled={quantity >= availableStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className="flex-1 clay-pill-btn py-3.5 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Basket • {formatCurrency(currentPrice * quantity)}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-11 h-11 rounded-full clay-circle-btn flex items-center justify-center transition-all ${
                  isFavorite
                    ? "text-red-500 bg-red-50"
                    : "text-brand-charcoal"
                }`}
                title={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Maker Direct Contact / Custom Order Button */}
          {product.store && (
            <div className="p-4 rounded-2xl clay-card bg-brand-butter/25 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-brand-charcoal">
                  Want something customized?
                </p>
                <p className="text-[11px] text-brand-stone">
                  Direct inquiry to {product.store.storeName}
                </p>
              </div>
              <button
                onClick={() => setIsEnquiryModalOpen(true)}
                className="px-4 py-2 rounded-full clay-pill text-xs font-bold text-brand-charcoal hover:shadow-clay-card flex items-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Custom Request</span>
              </button>
            </div>
          )}

          {/* Reassurance Features */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-brand-clay/30 text-center text-[11px] font-medium text-brand-stone">
            <div className="p-3 rounded-2xl clay-card bg-white">
              <Truck className="w-4 h-4 text-brand-terracotta mx-auto mb-1" />
              <span>Ships in {product.estimatedDispatchDays} days</span>
            </div>
            <div className="p-3 rounded-2xl clay-card bg-white">
              <ShieldCheck className="w-4 h-4 text-brand-sage mx-auto mb-1" />
              <span>Authentic Craft</span>
            </div>
            <div className="p-3 rounded-2xl clay-card bg-white">
              <RotateCcw className="w-4 h-4 text-brand-gold mx-auto mb-1" />
              <span>14-day Returns</span>
            </div>
          </div>

          {/* Craftsmanship & Details Accordion / Tabs */}
          <div className="space-y-3 pt-3 border-t border-brand-clay/30 text-xs">
            {product.craftDetails && (
              <div className="p-4 rounded-2xl clay-card bg-white space-y-1">
                <span className="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">
                  Craftsmanship &amp; Materials
                </span>
                <p className="text-brand-stone leading-relaxed">{product.craftDetails}</p>
              </div>
            )}

            {product.careInstructions && (
              <div className="p-4 rounded-2xl clay-card bg-white space-y-1">
                <span className="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">
                  Care Instructions
                </span>
                <p className="text-brand-stone leading-relaxed">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-brand-clay/40">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
              More Handcrafted Pieces You Might Love
            </h2>
            <Link
              href="/marketplace"
              className="text-xs font-bold text-brand-stone hover:text-brand-terracotta"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="clay-card rounded-[28px] p-4 transition-all hover:scale-[1.01]"
              >
                <div className="relative aspect-square rounded-[20px] overflow-hidden bg-brand-sand mb-3">
                  <Image
                    src={rel.images?.[0]?.url || selectedImage}
                    alt={rel.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-serif font-bold text-sm text-brand-charcoal line-clamp-1">
                  <Link href={`/product/${rel.slug}`}>{rel.title}</Link>
                </h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-clay/30">
                  <span className="font-serif font-bold text-sm text-brand-charcoal">
                    {formatCurrency(rel.price)}
                  </span>
                  <Link
                    href={`/product/${rel.slug}`}
                    className="text-xs font-semibold text-brand-terracotta hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Enquiry Modal */}
      {product.store && (
        <CustomEnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          storeId={product.store.id}
          storeName={product.store.storeName}
          productId={product.id}
          productTitle={product.title}
        />
      )}
    </div>
  );
}
