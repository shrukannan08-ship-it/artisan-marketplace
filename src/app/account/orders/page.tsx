import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Truck, ArrowRight, Store, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/marketplace-queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "My Orders | Mitti & Muse",
  description: "Track your orders and view order history.",
};

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();

  const orders = user ? await getUserOrders(user.id) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
          Account Dashboard
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
          Your Order History
        </h1>
        <p className="text-xs text-brand-stone mt-1">
          Track fulfillment status from our independent maker studios.
        </p>
      </div>

      {!user ? (
        <div className="clay-card rounded-[32px] p-8 sm:p-12 text-center space-y-4 bg-white max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-[22px] bg-brand-peach/60 flex items-center justify-center mx-auto text-brand-terracotta shadow-clay-card border-t border-l border-white/80">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            Sign In to View Your Orders
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto leading-relaxed">
            Please log in with your customer account to view your past orders, delivery tracking numbers, and maker receipts.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/auth/login" className="clay-pill-btn text-xs px-6 py-2.5">
              Sign In
            </Link>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="clay-card rounded-[32px] p-12 text-center space-y-4 bg-white max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-[22px] bg-brand-sand/80 flex items-center justify-center mx-auto text-brand-stone shadow-clay-card border-t border-l border-white/80">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            No Orders Yet
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto leading-relaxed">
            You haven&apos;t placed any orders yet. Discover unique handmade ceramics, jewelry, and craft kits today!
          </p>
          <Link href="/marketplace" className="clay-pill-btn text-xs px-6 py-2.5 inline-block">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="clay-card rounded-[28px] p-6 space-y-4 bg-white"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-clay/30 text-xs">
                <div>
                  <span className="text-brand-stone">Order Number:</span>{" "}
                  <strong className="text-brand-charcoal font-serif text-sm">
                    {order.orderNumber}
                  </strong>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-brand-stone flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-mint text-emerald-900 border-t border-l border-white/80 shadow-xs">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-sand shrink-0 shadow-xs">
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
                      <div>
                        <h4 className="text-xs font-bold text-brand-charcoal">
                          {item.productTitle}
                        </h4>
                        {item.variantName && (
                          <p className="text-[10px] text-brand-stone">{item.variantName}</p>
                        )}
                        <p className="text-[10px] text-brand-terracotta flex items-center gap-1 font-medium mt-0.5">
                          <Store className="w-3 h-3" />
                          <span>{item.store.storeName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-charcoal">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      <p className="text-[10px] text-brand-stone">Qty: {item.quantity}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-brand-mint/60 px-2 py-0.5 rounded-full">
                        Fulfillment: {item.fulfillmentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-brand-clay/30 flex items-center justify-between text-xs">
                <Link
                  href={`/order-confirmation/${order.id}`}
                  className="font-bold text-brand-terracotta hover:underline flex items-center gap-1"
                >
                  <span>View Full Receipt</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <div className="text-right">
                  <span className="text-brand-stone">Total: </span>
                  <strong className="font-serif text-base text-brand-charcoal">
                    {formatCurrency(order.totalAmount)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
