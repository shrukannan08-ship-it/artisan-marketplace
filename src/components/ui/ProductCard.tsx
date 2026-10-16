"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
  badge?: string;
  badgeColor?: "terracotta" | "sage" | "gold" | "rose";
}

export default function ProductCard({
  product,
  badge,
  badgeColor = "terracotta",
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80";

  const badgeColorClasses = {
    terracotta: "bg-brand-terracotta/15 text-brand-terracotta border-brand-terracotta/30",
    sage: "bg-brand-sage/15 text-brand-sage-dark border-brand-sage/30",
    gold: "bg-brand-gold/15 text-brand-charcoal border-brand-gold/30",
    rose: "bg-brand-rose/20 text-brand-charcoal border-brand-rose/40",
  }[badgeColor];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.variants?.[0] || null, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-brand-clay/70 p-3.5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-brand-sand/50 mb-3.5">
          <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </Link>

          {/* Badge */}
          {badge && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-xs shadow-xs ${badgeColorClasses}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{badge}</span>
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all shadow-subtle ${
              isFavorite
                ? "bg-white text-red-500 shadow-md"
                : "bg-white/80 text-brand-charcoal hover:bg-white hover:text-red-500"
            }`}
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${isFavorite ? "fill-red-500 scale-110" : ""}`}
            />
          </button>

          {/* Stock Alert Pill if low */}
          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <div className="absolute bottom-2 left-2.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/90 text-white backdrop-blur-xs">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="space-y-1.5 px-1">
          {/* Seller / Store Attribution */}
          {product.store && (
            <div className="flex items-center justify-between text-xs">
              <Link
                href={`/store/${product.store.slug}`}
                className="text-[11px] font-medium text-brand-stone hover:text-brand-terracotta truncate transition-colors"
              >
                {product.store.storeName}
              </Link>
              <div className="flex items-center gap-1 text-[11px] font-medium text-brand-charcoal">
                <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                <span>{product.store.rating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* Product Title */}
          <h3 className="font-serif text-base font-bold text-brand-charcoal leading-snug line-clamp-1 group-hover:text-brand-terracotta transition-colors">
            <Link href={`/product/${product.slug}`}>{product.title}</Link>
          </h3>

          {/* Category Tag */}
          {product.category && (
            <p className="text-[11px] text-brand-stone/80 line-clamp-1">
              {product.category.name}
            </p>
          )}
        </div>
      </div>

      {/* Price & Action Button (Reference 2 style) */}
      <div className="mt-3.5 pt-3 border-t border-brand-clay/40 flex items-center justify-between px-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-lg font-bold text-brand-charcoal">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-brand-stone line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-cream border border-brand-clay text-brand-charcoal text-xs font-semibold hover:bg-brand-terracotta hover:text-white hover:border-brand-terracotta shadow-xs active:scale-95 transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
