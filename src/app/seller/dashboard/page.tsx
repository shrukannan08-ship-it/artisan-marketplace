"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Store,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SellerStats {
  metrics: {
    totalRevenueCents: number;
    totalOrdersCount: number;
    pendingOrdersCount: number;
    activeProductsCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  recentOrders: {
    id: string;
    orderId: string;
    orderNumber: string;
    productTitle: string;
    variantName?: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    fulfillmentStatus: string;
    createdAt: string;
    customerName: string;
  }[];
  lowStockProducts: {
    id: string;
    title: string;
    stock: number;
    lowStockThreshold: number;
    price: number;
    imageUrl?: string;
  }[];
}

export default function SellerDashboardPage() {
  const [data, setData] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/seller/stats");
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-medium text-brand-stone">
          Loading your Studio Analytics...
        </p>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRevenueCents: 0,
    totalOrdersCount: 0,
    pendingOrdersCount: 0,
    activeProductsCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header echoing reference design */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-peach/25 text-[#9E3F28] border border-brand-peach/50 mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Management Hub</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
            Dashboard
          </h1>
          <p className="text-xs text-brand-stone mt-1">
            Real metrics derived from your authentic customer sales &amp; inventory.
          </p>
        </div>

        {/* Quick Actions matching the reference design pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/seller/products/new"
            className="clay-pill-btn bg-gradient-to-b from-[#df7c64] to-[#C86D51] text-white hover:brightness-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-butter" />
            <span>Add First Creation</span>
          </Link>
          <Link
            href="/seller/products"
            className="clay-pill px-4 py-2 hover:bg-white text-brand-charcoal"
          >
            <span>Catalog</span>
          </Link>
          <Link
            href="/seller/orders"
            className="clay-pill px-4 py-2 hover:bg-white text-brand-charcoal"
          >
            <span>Orders</span>
          </Link>
        </div>
      </div>

      {/* 1. TACTILE METRIC CARDS (Directly inspired by Reference Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue Card with Peach Plate */}
        <div className="clay-card p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#FFF8F5] via-[#FCFAF7] to-[#FBECE6] border-brand-peach/30">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-stone">
                Total Revenue
              </span>
              <div className="w-10 h-10 rounded-[16px] bg-gradient-to-b from-[#df7c64] to-[#C86D51] text-white flex items-center justify-center shadow-clay-circle border-t border-white/40">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-brand-charcoal mt-3">
              {formatCurrency(metrics.totalRevenueCents)}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-peach/30 text-[#9E3F28] border border-brand-peach/50 shadow-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Verified Patron Orders</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-brand-peach/20 blur-xl pointer-events-none" />
        </div>

        {/* Orders Card with Buttercup Yellow Plate */}
        <div className="clay-card p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#FFFCF0] via-[#FCFAF7] to-[#FAF1D6] border-brand-butter/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-stone">
                Total Orders
              </span>
              <div className="w-10 h-10 rounded-[16px] bg-gradient-to-b from-brand-butter to-brand-butter-dark text-[#6E4F10] flex items-center justify-center shadow-clay-circle border-t border-white/60">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-brand-charcoal mt-3">
              {metrics.totalOrdersCount}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-butter/50 text-[#6E4F10] border border-brand-butter/70 shadow-xs">
              <span>{metrics.pendingOrdersCount} awaiting fulfillment</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-brand-butter/25 blur-xl pointer-events-none" />
        </div>

        {/* Active Products Card with Mint Eucalyptus Plate */}
        <div className="clay-card p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#F5FCF9] via-[#FCFAF7] to-[#E5F5EF] border-brand-mint/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-stone">
                Active Catalog
              </span>
              <div className="w-10 h-10 rounded-[16px] bg-gradient-to-b from-brand-mint to-brand-mint-dark text-[#1F5440] flex items-center justify-center shadow-clay-circle border-t border-white/60">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-brand-charcoal mt-3">
              {metrics.activeProductsCount}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-mint/40 text-[#1F5440] border border-brand-mint/60 shadow-xs">
              <span>Handcrafted pieces published</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-brand-mint/25 blur-xl pointer-events-none" />
        </div>

        {/* Inventory Alerts Card with Sky Blue Plate */}
        <div className="clay-card p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#F4FAFE] via-[#FCFAF7] to-[#E3EFF9] border-brand-sky/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-stone">
                Inventory Alerts
              </span>
              <div className="w-10 h-10 rounded-[16px] bg-gradient-to-b from-brand-sky to-brand-sky-dark text-[#1A4F72] flex items-center justify-center shadow-clay-circle border-t border-white/60">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-3xl font-bold text-brand-charcoal mt-3">
              {metrics.lowStockCount}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-sky/40 text-[#1A4F72] border border-brand-sky/60 shadow-xs">
              <span>{metrics.lowStockCount > 0 ? "Requires restock" : "Healthy inventory"}</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-brand-sky/25 blur-xl pointer-events-none" />
        </div>
      </div>

      {/* 2. MAKER STUDIO LAUNCH CHECKLIST (Layered Tactile Card) */}
      <div className="clay-card p-6 sm:p-8 bg-gradient-to-r from-brand-peach/15 via-[#FCFAF7] to-brand-butter/20 border-brand-clay/80">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-clay-circle text-brand-terracotta">
            <Sparkles className="w-4 h-4 text-brand-gold" />
          </div>
          <h2 className="font-serif text-lg font-bold text-brand-charcoal">
            Maker Studio Launch Checklist
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-[22px] bg-white border border-brand-clay/70 shadow-subtle flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-sage shrink-0" />
            <div>
              <p className="font-bold text-brand-charcoal">Storefront Active</p>
              <p className="text-brand-stone text-[11px]">Brand story &amp; location configured</p>
            </div>
          </div>
          <div className="p-4 rounded-[22px] bg-white border border-brand-clay/70 shadow-subtle flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-sage shrink-0" />
            <div>
              <p className="font-bold text-brand-charcoal">Catalog Ready</p>
              <p className="text-brand-stone text-[11px]">{metrics.activeProductsCount} products published</p>
            </div>
          </div>
          <div className="p-4 rounded-[22px] bg-white border border-brand-clay/70 shadow-subtle flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-sage shrink-0" />
            <div>
              <p className="font-bold text-brand-charcoal">Checkout Enabled</p>
              <p className="text-brand-stone text-[11px]">Direct patron payments active</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT ORDERS & LOW STOCK SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-clay/40">
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Recent Orders for Your Studio
              </h2>
              <p className="text-xs text-brand-stone">Fulfill and track customer purchases</p>
            </div>
            <Link
              href="/seller/orders"
              className="text-xs font-semibold text-brand-terracotta hover:underline"
            >
              View All Orders &rarr;
            </Link>
          </div>

          {(!data?.recentOrders || data.recentOrders.length === 0) ? (
            <div className="py-12 text-center text-xs text-brand-stone">
              No orders received yet. When customers buy your products, they will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-brand-clay/50 bg-brand-cream/30 hover:bg-brand-cream/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-serif text-brand-charcoal text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-sand text-brand-charcoal border border-brand-clay">
                        {order.fulfillmentStatus}
                      </span>
                    </div>
                    <p className="text-brand-charcoal font-medium mt-1">
                      {order.productTitle} {order.variantName ? `(${order.variantName})` : ""}
                    </p>
                    <p className="text-[11px] text-brand-stone mt-0.5">
                      Customer: {order.customerName} • Qty: {order.quantity}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                    <span className="font-serif font-bold text-sm text-brand-charcoal">
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <Link
                      href="/seller/orders"
                      className="text-[11px] font-semibold text-brand-terracotta hover:underline mt-1"
                    >
                      Update Fulfillment &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warnings Widget */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-clay/40">
            <h3 className="font-serif text-base font-bold text-brand-charcoal flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Stock Alert</span>
            </h3>
            <Link
              href="/seller/products"
              className="text-xs font-semibold text-brand-terracotta hover:underline"
            >
              Inventory
            </Link>
          </div>

          {(!data?.lowStockProducts || data.lowStockProducts.length === 0) ? (
            <div className="py-8 text-center text-xs text-brand-stone">
              <p>✓ All items have sufficient stock.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-charcoal truncate">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Remaining stock: <strong>{p.stock}</strong> (Threshold: {p.lowStockThreshold})
                    </p>
                  </div>
                  <Link
                    href={`/seller/products`}
                    className="px-3 py-1 rounded-full bg-white border border-amber-300 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 shrink-0"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
