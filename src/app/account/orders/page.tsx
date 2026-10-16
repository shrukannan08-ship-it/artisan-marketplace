import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Truck, ArrowRight, Store, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "My Orders | Mitti & Muse",
  description: "Track your orders and view order history.",
};

export default async function CustomerOrdersPage() {
  const user = await getCurrentUser();

  // If user is not logged in, or fetch orders by user or demo customer
  const orders = user
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              store: true,
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

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
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-8 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 rounded-full bg-brand-blush flex items-center justify-center mx-auto text-brand-terracotta">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            Sign In to View Your Orders
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto">
            Please log in with your customer account to view your past orders, delivery tracking numbers, and maker receipts.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/auth/login" className="btn-primary text-xs px-6 py-2.5">
              Sign In
            </Link>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-brand-stone">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            No Orders Yet
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Discover unique handmade ceramics, jewelry, and craft kits today!
          </p>
          <Link href="/marketplace" className="btn-primary text-xs px-6 py-2.5 inline-block">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-brand-clay/70 p-6 shadow-soft space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-clay/40 text-xs">
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
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-sage-light text-brand-sage-dark border border-brand-sage/20">
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
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-sand shrink-0">
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
                      <span className="inline-block mt-1 text-[10px] font-medium text-brand-sage">
                        Fulfillment: {item.fulfillmentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-brand-clay/40 flex items-center justify-between text-xs">
                <Link
                  href={`/order-confirmation/${order.id}`}
                  className="font-medium text-brand-terracotta hover:underline flex items-center gap-1"
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
