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
    terracotta: "bg-brand-peach/30 text-[#A84832] border-brand-peach/60 shadow-xs",
    sage: "bg-brand-mint/40 text-[#285844] border-brand-mint/70 shadow-xs",
    gold: "bg-brand-butter/50 text-[#7D5A16] border-brand-butter/80 shadow-xs",
    rose: "bg-brand-lilac/45 text-[#4A386D] border-brand-lilac/70 shadow-xs",
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
    <div className="group relative clay-card hover:clay-card-hover p-4 flex flex-col justify-between">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-[22px] overflow-hidden bg-brand-sand/50 mb-3.5 border border-brand-clay/50 shadow-inner-soft">
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
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-xs shadow-clay-pill ${badgeColorClasses}`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{badge}</span>
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs transition-all shadow-clay-circle ${
              isFavorite
                ? "bg-white text-red-500 shadow-md"
                : "bg-white/90 text-brand-charcoal hover:bg-white hover:text-red-500"
            }`}
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${isFavorite ? "fill-red-500 scale-110" : ""}`}
            />
          </button>

          {/* Stock Alert Pill if low */}
          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
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
                className="text-[11px] font-semibold text-brand-stone hover:text-brand-terracotta truncate transition-colors"
              >
                {product.store.storeName}
              </Link>
              <div className="flex items-center gap-1 text-[11px] font-bold text-brand-charcoal">
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
            <p className="text-[11px] text-brand-stone/80 line-clamp-1 font-medium">
              {product.category.name}
            </p>
          )}
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="mt-3.5 pt-3 border-t border-brand-clay/50 flex items-center justify-between px-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-lg font-bold text-brand-charcoal">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-brand-stone line-through font-medium">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="clay-pill px-3.5 py-1.5 text-brand-charcoal hover:bg-brand-peach hover:text-white hover:border-brand-peach active:scale-95 transition-all text-xs font-bold"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
