"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Form states
  const [fullName, setFullName] = useState(user?.name || "Priya Sharma");
  const [email, setEmail] = useState(user?.email || "priya@example.com");
  const [street, setStreet] = useState("742 Evergreen Terrace");
  const [apartment, setApartment] = useState("Apt 4B");
  const [city, setCity] = useState("Portland");
  const [state, setState] = useState("OR");
  const [postalCode, setPostalCode] = useState("97201");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("+1 555-012-3456");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingAmount = subtotal >= 5000 || subtotal === 0 ? 0 : 500;
  const estimatedTax = Math.round(subtotal * 0.08);
  const totalAmount = subtotal + shippingAmount + estimatedTax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
        customerInfo: {
          fullName,
          email,
          street,
          apartment,
          city,
          state,
          postalCode,
          country,
          phone,
        },
        paymentMethod: "TEST_CARD",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order");
      }

      // Success! Clear basket and navigate to receipt
      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during checkout");
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-brand-charcoal">
          Your basket is empty
        </h1>
        <p className="text-xs text-brand-stone">
          Add items to your basket before checking out.
        </p>
        <Link href="/marketplace" className="btn-primary text-xs px-6 py-2.5 inline-block">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/cart"
          className="text-xs font-semibold text-brand-stone hover:text-brand-terracotta flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Basket</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal">
          Secure Artisan Checkout
        </h1>
        <p className="text-xs text-brand-stone mt-1">
          Review your address and complete your order.
        </p>
      </div>

      {/* Development Mode Notice (Required by prompt) */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>Test Payment Environment Active</span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          This checkout environment is operating in functional development mode. Orders create genuine persistent database records and validate server-side stock levels without charging a live credit card. Live Stripe/Razorpay webhooks can be enabled anytime via environment variables.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Checkout Form & Summary Grid */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Shipping & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact & Shipping Address Card */}
          <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-brand-clay/40">
              <div className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Delivery Address
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    Email Address (for order updates) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address or P.O. box"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    Apartment / Suite
                  </label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Method Card */}
          <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-brand-clay/40">
              <div className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Payment Method
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-brand-cream/60 border border-brand-clay space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-brand-charcoal">
                  <CreditCard className="w-4 h-4 text-brand-terracotta" />
                  <span>Instant Test Card (Sandbox)</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-brand-sage bg-brand-sage-light px-2.5 py-0.5 rounded-full">
                  Ready to test
                </span>
              </div>
              <p className="text-xs text-brand-stone">
                Card ending in <strong className="text-brand-charcoal">4242</strong> (Simulated Visa). No real funds will be deducted.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-card space-y-6">
          <h2 className="font-serif text-xl font-bold text-brand-charcoal">
            Items in Order ({items.length})
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
            {items.map((item) => {
              const primaryImage =
                item.product.images?.find((img) => img.isPrimary)?.url ||
                item.product.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80";
              const itemPrice = item.product.price + (item.variant?.priceDelta || 0);

              return (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-brand-clay/30">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-sand shrink-0">
                    <Image
                      src={primaryImage}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-brand-charcoal truncate">
                      {item.product.title}
                    </p>
                    {item.variant && (
                      <p className="text-[10px] text-brand-stone">
                        {item.variant.name}: {item.variant.option}
                      </p>
                    )}
                    <p className="text-[10px] text-brand-stone">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-charcoal">
                    {formatCurrency(itemPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-xs text-brand-stone pt-2 border-t border-brand-clay/50">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-charcoal">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-brand-charcoal">
                {shippingAmount === 0 ? "FREE" : formatCurrency(shippingAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated Sales Tax</span>
              <span className="font-semibold text-brand-charcoal">
                {formatCurrency(estimatedTax)}
              </span>
            </div>

            <div className="pt-3 border-t border-brand-clay/60 flex items-center justify-between text-base font-bold text-brand-charcoal">
              <span>Total to Pay</span>
              <span className="font-serif text-2xl text-brand-terracotta">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-sm shadow-clay flex items-center justify-center gap-2 font-bold tracking-wide"
          >
            {loading ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Place Order • {formatCurrency(totalAmount)}</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-brand-stone">
            By placing your order, you agree to Mitti &amp; Muse terms of service and artisan care policies.
          </p>
        </div>
      </form>
    </div>
  );
}
