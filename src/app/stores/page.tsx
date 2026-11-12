import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Sparkles, ArrowRight, Store as StoreIcon } from "lucide-react";
import { getAllStoresWithProducts } from "@/lib/marketplace-queries";

export const metadata = {
  title: "Independent Artisan Studios & Boutique Brands | Mitti & Muse",
  description:
    "Explore independent ceramicists, jewelry makers, candle pourers, and textile artisans sharing their handmade creations.",
};

export default async function StoresPage() {
  const stores = await getAllStoresWithProducts(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="clay-card rounded-[32px] p-8 sm:p-12 bg-gradient-to-r from-brand-peach/40 via-white to-brand-butter/40 space-y-3">
        <span className="text-xs font-bold tracking-wider uppercase text-brand-terracotta flex items-center gap-1.5">
          <StoreIcon className="w-4 h-4" />
          <span>Curated Maker Studios</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
          Independent Brands &amp; Artisans
        </h1>
        <p className="text-sm text-brand-stone max-w-xl leading-relaxed">
          Every storefront on Mitti &amp; Muse is independently owned and operated by small-batch makers, women entrepreneurs, and creative craftspeople.
        </p>
      </div>

      {/* Grid of Stores */}
      {stores.length === 0 ? (
        <div className="clay-card rounded-[32px] p-12 sm:p-16 text-center space-y-4 bg-white max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-[22px] bg-brand-peach/60 flex items-center justify-center mx-auto text-brand-terracotta shadow-clay-card border-t border-l border-white/80">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-brand-charcoal">
            Independent Studios Are Setting Up
          </h3>
          <p className="text-xs sm:text-sm text-brand-stone max-w-md mx-auto leading-relaxed">
            Mitti &amp; Muse is currently welcoming small-batch artisans, jewelry creators, ceramists, and ethical fashion entrepreneurs. Open your digital atelier today.
          </p>
          <div className="pt-3">
            <Link
              href="/auth/owner/register"
              className="clay-pill-btn text-xs px-6 py-3 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Your Store &amp; Brand Profile</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map((store) => (
            <div
              key={store.id}
              className="clay-card rounded-[28px] overflow-hidden flex flex-col justify-between bg-white hover:shadow-clay-card transition-all"
            >
              <div>
                {/* Banner with Logo Overlay */}
                <div className="relative h-44 w-full bg-brand-sand">
                  {store.bannerUrl && (
                    <Image
                      src={store.bannerUrl}
                      alt={store.storeName}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute -bottom-4 left-6 w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-clay-card bg-white">
                    {store.logoUrl ? (
                      <Image
                        src={store.logoUrl}
                        alt={store.storeName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-lg font-serif">
                        {store.storeName.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="pt-6 px-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-brand-charcoal">
                      {store.storeName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-charcoal">
                      <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                      <span>{store.rating.toFixed(1)}</span>
                      <span className="text-brand-stone font-normal">({store.reviewCount})</span>
                    </div>
                  </div>

                  {store.location && (
                    <p className="text-xs text-brand-stone flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-terracotta" />
                      <span>{store.location}</span>
                    </p>
                  )}

                  <p className="text-xs text-brand-stone line-clamp-2 leading-relaxed">
                    {store.tagline || store.description}
                  </p>

                  {/* Sample Products Preview */}
                  {store.products.length > 0 && (
                    <div className="pt-3">
                      <p className="text-[10px] uppercase font-bold text-brand-stone tracking-wider mb-2">
                        Featured Pieces
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {store.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="relative aspect-square rounded-xl overflow-hidden bg-brand-sand border border-brand-clay/40 shadow-xs"
                          >
                            {prod.images[0]?.url && (
                              <Image
                                src={prod.images[0].url}
                                alt={prod.title}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-6 pt-4 border-t border-brand-clay/30 mt-4 flex items-center justify-between">
                <span className="text-xs text-brand-stone font-medium">
                  {store.products.length} listed creations
                </span>
                <Link
                  href={`/store/${store.slug}`}
                  className="clay-pill-btn text-xs px-5 py-2.5 flex items-center gap-1.5"
                >
                  <span>Visit Storefront</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
