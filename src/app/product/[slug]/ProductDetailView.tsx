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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-brand-sand/50 border border-brand-clay/70 shadow-card">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              priority
              className="object-cover transition-all duration-300"
            />
            {product.featured && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-terracotta text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curator&apos;s Pick</span>
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-brand-sand/50 border-2 transition-all shrink-0 ${
                    selectedImage === img.url
                      ? "border-brand-terracotta scale-105 shadow-sm"
                      : "border-brand-clay/70 opacity-70 hover:opacity-100"
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
          {/* Store info */}
          {product.store && (
            <div className="flex items-center justify-between pb-2 border-b border-brand-clay/40">
              <Link
                href={`/store/${product.store.slug}`}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-brand-sand overflow-hidden border border-brand-clay relative">
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

              <div className="flex items-center gap-1 text-xs font-semibold text-brand-charcoal">
                <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                <span>{product.store.rating.toFixed(1)}</span>
                <span className="text-brand-stone text-[11px]">
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
              <p className="text-xs font-medium text-brand-terracotta mt-1">
                {product.category.name}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-brand-charcoal">
              {formatCurrency(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-base text-brand-stone line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-sage-light text-brand-sage-dark">
              Taxes included
            </span>
          </div>

          <p className="text-sm text-brand-stone leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                {product.variants[0]?.name || "Select Option"}:{" "}
                <span className="text-brand-terracotta normal-case font-bold">
                  {selectedVariant?.option}
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-2xl text-xs font-medium border transition-all ${
                      selectedVariant?.id === v.id
                        ? "bg-brand-terracotta text-white border-brand-terracotta shadow-xs"
                        : "bg-white text-brand-charcoal border-brand-clay hover:border-brand-stone/50"
                    }`}
                  >
                    <span>{v.option}</span>
                    {v.priceDelta !== 0 && (
                      <span className="ml-1 opacity-80">
                        ({v.priceDelta > 0 ? "+" : ""}
                        {formatCurrency(v.priceDelta)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {availableStock > 0 ? (
              availableStock <= product.lowStockThreshold ? (
                <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  ⚠️ Only {availableStock} handcrafted pieces left in stock!
                </span>
              ) : (
                <span className="text-brand-sage-dark bg-brand-sage-light px-3 py-1 rounded-full border border-brand-sage/20">
                  ✓ In Stock &amp; Ready to Dispatch
                </span>
              )
            ) : (
              <span className="text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-clay rounded-full bg-white px-3 py-1.5 shadow-subtle">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-brand-stone hover:text-brand-charcoal"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-brand-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="p-1 text-brand-stone hover:text-brand-charcoal"
                  disabled={quantity >= availableStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className="flex-1 btn-primary py-3.5 text-sm shadow-clay"
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
                className={`p-3.5 rounded-full border border-brand-clay transition-all shadow-subtle ${
                  isFavorite
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white text-brand-charcoal hover:bg-brand-sand"
                }`}
                title={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Maker Direct Contact / Custom Order Button */}
          {product.store && (
            <div className="p-4 rounded-2xl bg-brand-sand/60 border border-brand-clay flex items-center justify-between">
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
                className="px-4 py-2 rounded-full bg-white border border-brand-clay text-xs font-semibold text-brand-charcoal hover:bg-brand-cream shadow-xs flex items-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Custom Request</span>
              </button>
            </div>
          )}

          {/* Reassurance Features */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-brand-clay/40 text-center text-[11px] font-medium text-brand-stone">
            <div className="p-3 rounded-2xl bg-white border border-brand-clay/60">
              <Truck className="w-4 h-4 text-brand-terracotta mx-auto mb-1" />
              <span>Ships in {product.estimatedDispatchDays} days</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-brand-clay/60">
              <ShieldCheck className="w-4 h-4 text-brand-sage mx-auto mb-1" />
              <span>Authentic Craft</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-brand-clay/60">
              <RotateCcw className="w-4 h-4 text-brand-gold mx-auto mb-1" />
              <span>14-day Returns</span>
            </div>
          </div>

          {/* Craftsmanship & Details Accordion / Tabs */}
          <div className="space-y-3 pt-4 border-t border-brand-clay/40 text-xs">
            {product.craftDetails && (
              <div className="p-4 rounded-2xl bg-white border border-brand-clay/60 space-y-1">
                <span className="font-bold text-brand-charcoal uppercase tracking-wider text-[10px]">
                  Craftsmanship &amp; Materials
                </span>
                <p className="text-brand-stone leading-relaxed">{product.craftDetails}</p>
              </div>
            )}

            {product.careInstructions && (
              <div className="p-4 rounded-2xl bg-white border border-brand-clay/60 space-y-1">
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
        <section className="pt-12 border-t border-brand-clay/60">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
              More Handcrafted Pieces You Might Love
            </h2>
            <Link
              href="/marketplace"
              className="text-xs font-semibold text-brand-stone hover:text-brand-terracotta"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="bg-white rounded-3xl border border-brand-clay/70 p-4 shadow-soft hover:shadow-card transition-all"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-sand mb-3">
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
