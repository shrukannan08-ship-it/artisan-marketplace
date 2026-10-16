"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const FREE_SHIPPING_THRESHOLD = 5000; // $50.00
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const discountAmount = couponApplied ? Math.round(subtotal * 0.1) : 0; // 10% discount
  const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 500;
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.08);
  const finalTotal = subtotal - discountAmount + shippingAmount + estimatedTax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "MAKER10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try MAKER10 for 10% off!");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-blush flex items-center justify-center mx-auto text-brand-terracotta">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
          Your Shopping Basket is Empty
        </h1>
        <p className="text-sm text-brand-stone max-w-md mx-auto leading-relaxed">
          Explore handmade ceramics, botanical jewelry, hand-poured candles, and creative craft kits from independent makers.
        </p>
        <Link href="/marketplace" className="btn-primary px-8 py-3.5 inline-flex">
          <span>Explore Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-clay/60">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
            Your Shopping Basket
          </h1>
          <p className="text-xs text-brand-stone mt-1">
            {itemCount} {itemCount === 1 ? "creation" : "creations"} in your basket
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-brand-stone hover:text-red-500 transition-colors"
        >
          Clear Basket
        </button>
      </div>

      {/* Free Shipping Meter (Reference 2 style) */}
      <div className="p-4 rounded-2xl bg-white border border-brand-clay/70 shadow-soft">
        <div className="flex items-center justify-between text-xs font-medium text-brand-charcoal mb-2">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-gold" />
            {remainingForFreeShipping > 0 ? (
              <>
                Add <strong className="text-brand-terracotta">{formatCurrency(remainingForFreeShipping)}</strong> more to unlock Free Shipping!
              </>
            ) : (
              <span className="text-brand-sage font-bold">✨ You have unlocked FREE Shipping!</span>
            )}
          </span>
          <span className="text-brand-stone">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="w-full bg-brand-clay/40 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-terracotta h-full rounded-full transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemPrice = item.product.price + (item.variant?.priceDelta || 0);
            const lineTotal = itemPrice * item.quantity;
            const primaryImage =
              item.product.images?.find((img) => img.isPrimary)?.url ||
              item.product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80";

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-brand-clay/70 p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-brand-sand shrink-0">
                    <Image
                      src={primaryImage}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-brand-charcoal">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="hover:text-brand-terracotta"
                      >
                        {item.product.title}
                      </Link>
                    </h3>

                    {item.variant && (
                      <p className="text-xs text-brand-stone mt-0.5">
                        {item.variant.name}: {item.variant.option}
                      </p>
                    )}

                    {item.product.store && (
                      <p className="text-[11px] font-medium text-brand-terracotta mt-0.5">
                        By {item.product.store.storeName}
                      </p>
                    )}

                    <p className="text-xs font-semibold text-brand-charcoal mt-2">
                      {formatCurrency(itemPrice)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-clay/40">
                  {/* Quantity */}
                  <div className="flex items-center border border-brand-clay rounded-full bg-brand-cream/60 px-2.5 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-brand-stone hover:text-brand-charcoal"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-brand-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-brand-stone hover:text-brand-charcoal"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-serif font-bold text-base text-brand-charcoal min-w-[70px] text-right">
                    {formatCurrency(lineTotal)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-brand-stone hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-serif text-xl font-bold text-brand-charcoal">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-brand-stone">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-charcoal text-sm">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {couponApplied && (
              <div className="flex items-center justify-between text-brand-sage font-medium">
                <span>Artisan Promo (10% off)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-brand-charcoal">
                {shippingAmount === 0 ? "FREE" : formatCurrency(shippingAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-semibold text-brand-charcoal">
                {formatCurrency(estimatedTax)}
              </span>
            </div>

            <div className="pt-3 border-t border-brand-clay/60 flex items-center justify-between text-sm font-bold text-brand-charcoal">
              <span>Total</span>
              <span className="font-serif text-xl text-brand-terracotta">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>

          {/* Promo code */}
          <form onSubmit={handleApplyCoupon} className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Discount code (try MAKER10)"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-brand-cream/60 border border-brand-clay focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-cream border border-brand-clay text-xs font-semibold hover:bg-brand-sand text-brand-charcoal"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
            )}
            {couponApplied && (
              <p className="text-[11px] text-brand-sage mt-1 font-medium">
                ✓ Coupon MAKER10 applied successfully!
              </p>
            )}
          </form>

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            className="w-full btn-primary py-4 text-sm shadow-clay flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-brand-stone">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-sage" />
              <span>Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Direct Maker Ship</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
