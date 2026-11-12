"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ui/ProductCard";

export default function WishlistPage() {
  const { wishlistProducts, wishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 fill-brand-terracotta" />
          <span>Curated Favorites</span>
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
          Your Saved Wishlist ({wishlistCount})
        </h1>
        <p className="text-xs text-brand-stone mt-1">
          Handmade treasures you&apos;ve fallen in love with.
        </p>
      </div>

      {wishlistCount === 0 ? (
        <div className="clay-card rounded-[32px] p-12 text-center space-y-4 bg-white max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-[22px] bg-brand-peach/60 flex items-center justify-center mx-auto text-brand-terracotta shadow-clay-card border-t border-l border-white/80">
            <Heart className="w-8 h-8 fill-brand-terracotta" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto leading-relaxed">
            Tap the heart icon on any product in the marketplace or storefronts to save it to your wishlist for later.
          </p>
          <Link href="/marketplace" className="clay-pill-btn text-xs px-6 py-2.5 inline-flex items-center gap-2">
            <span>Explore Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
