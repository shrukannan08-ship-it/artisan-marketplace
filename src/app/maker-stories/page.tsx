import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart, Store } from "lucide-react";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Maker Stories & Craft Journal | Mitti & Muse",
  description:
    "Behind the studio doors: Intimate interviews, slow pottery techniques, botanical jewelry casting, and the artisans shaping mindful commerce.",
};

export default async function MakerStoriesPage() {
  const stores = await prisma.store.findMany({
    include: {
      products: {
        where: { status: "ACTIVE" },
        take: 2,
        include: { images: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-terracotta/10 text-brand-terracotta uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Maker Journal</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-charcoal leading-tight">
          Stories Carved, Cast &amp; Woven by Hand
        </h1>
        <p className="text-sm sm:text-base text-brand-stone leading-relaxed">
          Behind every mug, necklace, and soy candle on Mitti &amp; Muse is a quiet studio, hours of patient trial, and an artisan honoring traditional techniques.
        </p>
      </div>

      {/* Featured Maker Editorial Grid */}
      <div className="space-y-12">
        {stores.map((store, idx) => (
          <div
            key={store.id}
            className={`bg-white rounded-3xl sm:rounded-4xl border border-brand-clay/70 p-8 sm:p-12 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Story Text */}
            <div className={`space-y-5 ${idx % 2 === 1 ? "lg:col-span-7 lg:order-2" : "lg:col-span-7"}`}>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-terracotta uppercase tracking-wider">
                <Store className="w-3.5 h-3.5" />
                <span>{store.location || "Independent Studio"}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
                {store.storeName}
              </h2>

              <p className="text-sm sm:text-base text-brand-stone leading-relaxed whitespace-pre-line">
                {store.story || store.description}
              </p>

              {store.craftsmanship && (
                <div className="p-5 rounded-2xl bg-brand-cream/80 border border-brand-clay/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal mb-1">
                    Signature Technique &amp; Ethics
                  </h4>
                  <p className="text-xs text-brand-stone leading-relaxed">
                    {store.craftsmanship}
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Link
                  href={`/store/${store.slug}`}
                  className="btn-primary text-xs px-6 py-3 flex items-center gap-2"
                >
                  <span>Visit {store.storeName} Storefront</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Collage */}
            <div className={`space-y-4 ${idx % 2 === 1 ? "lg:col-span-5 lg:order-1" : "lg:col-span-5"}`}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-soft border border-brand-clay">
                {store.bannerUrl && (
                  <Image
                    src={store.bannerUrl}
                    alt={store.storeName}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {store.products.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {store.products.map((p) => (
                    <div
                      key={p.id}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-brand-sand border border-brand-clay/50 shadow-xs"
                    >
                      {p.images[0]?.url && (
                        <Image
                          src={p.images[0].url}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
