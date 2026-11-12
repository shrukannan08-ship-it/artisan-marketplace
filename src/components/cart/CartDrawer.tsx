"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 5000; // $50.00 in cents
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDFBF7] shadow-elevated flex flex-col border-l border-brand-clay/40">
          {/* Header */}
          <div className="p-6 border-b border-brand-clay/30 flex items-center justify-between bg-white/70 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-brand-peach/60 text-brand-terracotta flex items-center justify-center shadow-clay-card border-t border-l border-white/80">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-xl font-bold text-brand-charcoal">
                Your Basket ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="w-8 h-8 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress (Reference 2 style) */}
          <div className="p-4 bg-brand-butter/30 border-b border-brand-clay/30">
            <div className="flex items-center justify-between text-xs font-medium text-brand-charcoal mb-2">
              <span className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add <span className="font-bold text-brand-terracotta">{formatCurrency(remainingForFreeShipping)}</span> more for Free Shipping!
                  </>
                ) : (
                  <span className="text-emerald-800 font-bold">✨ You unlocked FREE Shipping!</span>
                )}
              </span>
              <span className="text-[11px] text-brand-stone font-bold">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full bg-brand-clay/30 h-2 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-brand-terracotta h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-[22px] bg-brand-peach/60 flex items-center justify-center mx-auto text-brand-terracotta shadow-clay-card border-t border-l border-white/80">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                  Your basket is empty
                </h3>
                <p className="text-xs text-brand-stone max-w-xs mx-auto leading-relaxed">
                  Explore one-of-a-kind pottery, botanical jewelry, hand-poured candles, and craft kits.
                </p>
                <div className="pt-2">
                  <Link
                    href="/marketplace"
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="clay-pill-btn inline-block text-xs px-6 py-2.5"
                  >
                    Explore Marketplace
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = (item.product.price + (item.variant?.priceDelta || 0)) * item.quantity;
                const primaryImage =
                  item.product.images?.find((img) => img.isPrimary)?.url ||
                  item.product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";

                return (
                  <div
                    key={item.id}
                    className="clay-card rounded-2xl p-3.5 flex gap-4 bg-white transition-all"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-sand shrink-0 shadow-xs">
                      <Image
                        src={primaryImage}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-brand-charcoal line-clamp-1">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-brand-stone hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.variant && (
                          <p className="text-[11px] text-brand-stone mt-0.5">
                            {item.variant.name}: {item.variant.option}
                          </p>
                        )}

                        {item.product.store?.storeName && (
                          <p className="text-[10px] text-brand-terracotta mt-0.5 font-medium">
                            By {item.product.store.storeName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-brand-clay/30">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1.5 bg-brand-sand/40 rounded-full p-1 border border-brand-clay/30 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-charcoal text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-brand-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-charcoal text-xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-brand-charcoal">
                          {formatCurrency(itemPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Checkout Section */}
          {items.length > 0 && (
            <div className="p-6 border-t border-brand-clay/30 bg-white/80 backdrop-blur-xs space-y-4 shadow-subtle">
              <div className="flex items-center justify-between text-base font-bold text-brand-charcoal">
                <span>Subtotal</span>
                <span className="font-serif text-lg text-brand-terracotta">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-brand-stone">
                Taxes and shipping calculated securely at checkout.
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full clay-pill-btn flex items-center justify-center gap-2 py-3.5 text-xs font-bold"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-2.5 text-xs text-center font-bold text-brand-stone hover:text-brand-charcoal transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
