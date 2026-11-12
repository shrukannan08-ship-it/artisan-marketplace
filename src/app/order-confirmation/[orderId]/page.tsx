import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Truck, ArrowRight, Store } from "lucide-react";
import { getOrderConfirmation } from "@/lib/marketplace-queries";
import { formatCurrency } from "@/lib/utils";

interface OrderConfirmationPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const { token } = await searchParams;

  const order = await getOrderConfirmation(orderId, token);

  if (!order) {
    notFound();
  }

  // Parse shipping address
  let addressObj: {
    fullName?: string;
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } = {};

  try {
    addressObj = JSON.parse(order.shippingAddress);
  } catch {
    addressObj = { fullName: "Valued Customer" };
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Celebration Header */}
      <div className="clay-card rounded-[32px] sm:rounded-[36px] p-8 sm:p-12 text-center space-y-5 bg-white">
        <div className="w-16 h-16 rounded-[22px] bg-brand-mint/70 text-emerald-900 flex items-center justify-center mx-auto shadow-clay-card border-t border-l border-white/90">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-brand-peach/60 text-brand-terracotta uppercase tracking-wider border-t border-l border-white/80 shadow-xs">
          Order Confirmed
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
          Thank you for supporting independent makers!
        </h1>

        <p className="text-sm text-brand-stone max-w-lg mx-auto leading-relaxed">
          Your order <strong className="text-brand-charcoal">{order.orderNumber}</strong> has been received by our artisan studios. They are already preparing your handmade creations with love.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link href="/account/orders" className="clay-pill-btn text-xs px-6 py-3">
            <Package className="w-4 h-4" />
            <span>Track in Your Account</span>
          </Link>
          <Link href="/marketplace" className="clay-pill text-xs px-6 py-3 text-brand-charcoal font-bold hover:shadow-clay-card transition-all">
            <span>Continue Browsing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Order Details & Items Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Items list */}
        <div className="md:col-span-7 clay-card rounded-[28px] p-6 sm:p-8 space-y-6 bg-white">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-3 border-b border-brand-clay/30">
            Handcrafted Items ({order.items.length})
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3 border-b border-brand-clay/30 last:border-0"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-brand-sand shrink-0 shadow-xs">
                  <Image
                    src={
                      item.product?.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={item.productTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-brand-charcoal truncate">
                    {item.productTitle}
                  </h4>
                  {item.variantName && (
                    <p className="text-[11px] text-brand-stone">{item.variantName}</p>
                  )}
                  <p className="text-[11px] text-brand-terracotta font-medium flex items-center gap-1 mt-0.5">
                    <Store className="w-3 h-3" />
                    <span>{item.store?.storeName || "Independent Studio"}</span>
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-brand-mint/60 px-2.5 py-0.5 rounded-full">
                    Status: {item.fulfillmentStatus}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-brand-charcoal">
                    {formatCurrency(item.totalPrice)}
                  </p>
                  <p className="text-[10px] text-brand-stone">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary & Delivery Address */}
        <div className="md:col-span-5 space-y-6">
          {/* Delivery Address */}
          <div className="clay-card rounded-[28px] p-6 space-y-3 bg-white">
            <h3 className="font-serif text-base font-bold text-brand-charcoal flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-terracotta" />
              <span>Shipping Destination</span>
            </h3>
            <div className="text-xs text-brand-stone leading-relaxed">
              <p className="font-bold text-brand-charcoal">{addressObj.fullName}</p>
              <p>{addressObj.street}</p>
              {addressObj.apartment && <p>{addressObj.apartment}</p>}
              <p>
                {addressObj.city}, {addressObj.state} {addressObj.postalCode}
              </p>
              <p>{addressObj.country}</p>
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="clay-card rounded-[28px] p-6 space-y-3 text-xs text-brand-stone bg-white">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-charcoal">
                {formatCurrency(order.subtotalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-brand-charcoal">
                {order.shippingAmount === 0 ? "FREE" : formatCurrency(order.shippingAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Sales Tax</span>
              <span className="font-semibold text-brand-charcoal">
                {formatCurrency(order.taxAmount)}
              </span>
            </div>
            <div className="pt-3 border-t border-brand-clay/30 flex justify-between text-base font-bold text-brand-charcoal">
              <span>Total Paid</span>
              <span className="font-serif text-xl text-brand-terracotta">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
