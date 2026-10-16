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
        <div className="w-screen max-w-md bg-white shadow-elevated flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-brand-clay/60 flex items-center justify-between bg-brand-cream/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-xl font-bold text-brand-charcoal">
                Your Basket ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-brand-sand text-brand-stone transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress (Reference 2 style) */}
          <div className="p-4 bg-brand-sand/50 border-b border-brand-clay/50">
            <div className="flex items-center justify-between text-xs font-medium text-brand-charcoal mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add <span className="font-bold text-brand-terracotta">{formatCurrency(remainingForFreeShipping)}</span> more for Free Shipping!
                  </>
                ) : (
                  <span className="text-brand-sage font-bold">✨ You unlocked FREE Shipping!</span>
                )}
              </span>
              <span className="text-[11px] text-brand-stone">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full bg-brand-clay/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-terracotta h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-brand-blush flex items-center justify-center mx-auto text-brand-terracotta">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                  Your basket is empty
                </h3>
                <p className="text-sm text-brand-stone max-w-xs mx-auto">
                  Explore one-of-a-kind pottery, botanical jewelry, hand-poured candles, and craft kits.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="btn-primary mt-2"
                >
                  <Link href="/marketplace">Explore Marketplace</Link>
                </button>
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
                    className="flex gap-4 p-3 rounded-2xl border border-brand-clay/60 hover:border-brand-clay transition-colors bg-white shadow-xs"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-sand shrink-0">
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
                          <h4 className="text-sm font-semibold text-brand-charcoal line-clamp-1">
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
                          <p className="text-xs text-brand-stone mt-0.5">
                            {item.variant.name}: {item.variant.option}
                          </p>
                        )}

                        {item.product.store?.storeName && (
                          <p className="text-[11px] text-brand-terracotta mt-0.5 font-medium">
                            By {item.product.store.storeName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-brand-clay/30">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-brand-clay rounded-full bg-brand-cream/60 px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-brand-stone hover:text-brand-charcoal"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-brand-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-brand-stone hover:text-brand-charcoal"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-brand-charcoal">
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
            <div className="p-6 border-t border-brand-clay/70 bg-brand-cream/30 space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-brand-charcoal">
                <span>Subtotal</span>
                <span className="font-serif text-lg">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-brand-stone">
                Taxes and shipping calculated securely at checkout.
              </p>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 shadow-clay"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-2.5 text-xs text-center font-medium text-brand-stone hover:text-brand-charcoal transition-colors"
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
