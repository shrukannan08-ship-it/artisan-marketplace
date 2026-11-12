import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Palette,
  MessageCircle,
  ExternalLink,
  Plus,
  Store,
} from "lucide-react";
import { getCurrentUser, isOwner } from "@/lib/auth";

export const metadata = {
  title: "Owner Studio Portal | Mitti & Muse",
};

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !isOwner(user)) {
    redirect("/auth/owner/login?redirect=/seller/dashboard");
  }

  const storeSlug = user.storeSlug || "mitti-ceramics";
  const storeName = user.storeName || "Your Studio";

  return (
    <div className="min-h-screen bg-brand-bisque flex flex-col md:flex-row">
      {/* Sidebar Navigation (Tactile Reference 1 & 4 style) */}
      <aside className="w-full md:w-64 bg-white/95 backdrop-blur-md border-r border-brand-clay/30 p-6 flex flex-col justify-between shrink-0 shadow-subtle">
        <div className="space-y-6">
          {/* Studio Brand Header */}
          <div className="p-4 rounded-2xl bg-brand-sand/50 border border-brand-clay/30 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>Seller Studio</span>
            </span>
            <h2 className="font-serif text-lg font-bold text-brand-charcoal mt-1 truncate">
              {storeName}
            </h2>
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              className="text-[11px] font-semibold text-brand-stone hover:text-brand-terracotta flex items-center gap-1 mt-1.5"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5 text-xs font-semibold text-brand-stone">
            <Link
              href="/seller/dashboard"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white hover:text-brand-charcoal hover:shadow-clay-card transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-terracotta" />
              <span>Studio Overview</span>
            </Link>

            <Link
              href="/seller/products"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white hover:text-brand-charcoal hover:shadow-clay-card transition-all"
            >
              <Package className="w-4 h-4 text-brand-sage" />
              <span>Products &amp; Stock</span>
            </Link>

            <Link
              href="/seller/orders"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white hover:text-brand-charcoal hover:shadow-clay-card transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              <span>Orders &amp; Fulfillment</span>
            </Link>

            <Link
              href="/seller/storefront"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white hover:text-brand-charcoal hover:shadow-clay-card transition-all"
            >
              <Palette className="w-4 h-4 text-brand-rose" />
              <span>Storefront Customizer</span>
            </Link>

            <Link
              href="/seller/enquiries"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hover:bg-white hover:text-brand-charcoal hover:shadow-clay-card transition-all"
            >
              <MessageCircle className="w-4 h-4 text-brand-lavender" />
              <span>Custom Enquiries</span>
            </Link>
          </nav>
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 border-t border-brand-clay/30 space-y-3">
          <Link
            href="/seller/products/new"
            className="w-full clay-pill-btn py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <Link
            href="/"
            className="block text-center text-xs font-semibold text-brand-stone hover:text-brand-charcoal transition-colors"
          >
            &larr; Return to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
