"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Store,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/marketplace");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-cream/95 backdrop-blur-md border-b border-brand-clay/60">
      {/* Top Announcement Bar (Reference 2 style) */}
      <div className="bg-[#f2e7de] text-brand-stone text-xs py-2 px-4 border-b border-brand-clay/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-medium text-brand-charcoal">
              <span>📦</span> Free Shipping on Orders Over $50
            </span>
            <span className="hidden md:inline text-brand-clay">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <span>🌿</span> Handmade Creativity, Happier Days
            </span>
            <span className="hidden lg:inline text-brand-clay">•</span>
            <span className="hidden lg:flex items-center gap-1.5">
              <span>✨</span> Direct Support for Independent Artisans
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-brand-charcoal">
            {user?.role === "SELLER" || user?.role === "OWNER" ? (
              <Link
                href="/seller/dashboard"
                className="hover:text-brand-terracotta flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Studio Dashboard</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth/customer/login"
                  className="hover:text-brand-terracotta flex items-center gap-1 text-[11px] text-brand-stone hover:text-brand-charcoal transition-colors"
                >
                  <span>Customer Sign In</span>
                </Link>
                <span className="text-brand-clay">•</span>
                <Link
                  href="/auth/owner/login"
                  className="hover:text-brand-terracotta flex items-center gap-1 text-[11px] font-medium text-brand-charcoal transition-colors"
                >
                  <Store className="w-3 h-3 text-brand-terracotta" />
                  <span>Owner Login</span>
                </Link>
                <span className="text-brand-clay">•</span>
                <Link
                  href="/auth/owner/register"
                  className="hover:text-brand-terracotta flex items-center gap-1 text-[11px] font-bold text-brand-terracotta transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-brand-gold" />
                  <span>Start Your Store</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-brand-charcoal hover:bg-brand-sand/60"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-brand-terracotta flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <span className="font-serif text-xl font-bold italic">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-charcoal leading-none">
                Mitti &amp; Muse
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-stone font-medium">
                Artisan Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Reference 2 style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-6 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pottery, jewelry, candles, DIY kits..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/90 rounded-full border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/40 focus:border-brand-terracotta shadow-subtle text-brand-charcoal placeholder:text-brand-stone/60"
            />
            <Search className="w-4 h-4 text-brand-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Link */}
            <Link
              href="/account/wishlist"
              className="relative p-2.5 rounded-full hover:bg-white text-brand-charcoal transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-terracotta text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-white text-brand-charcoal transition-colors flex items-center"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-terracotta text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white border border-brand-clay/70 hover:shadow-subtle transition-all"
                  >
                    <span className="text-xs font-medium text-brand-charcoal max-w-[100px] truncate hidden sm:inline">
                      {user.name.split(" ")[0]}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center font-medium text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-brand-stone" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-brand-clay/70 py-2 z-50">
                      <div className="px-4 py-2 border-b border-brand-clay/40">
                        <p className="text-xs text-brand-stone">Signed in as</p>
                        <p className="text-sm font-semibold text-brand-charcoal truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-brand-terracotta/10 text-brand-terracotta">
                          {user.role}
                        </span>
                      </div>

                      {(user.role === "SELLER" || user.role === "OWNER") && (
                        <div className="py-1 border-b border-brand-clay/40">
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-sand/50"
                          >
                            <Store className="w-4 h-4 text-brand-terracotta" />
                            <span>Studio Dashboard</span>
                          </Link>
                          {user.storeSlug && (
                            <Link
                              href={`/store/${user.storeSlug}`}
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-brand-stone hover:bg-brand-sand/50"
                            >
                              <Sparkles className="w-4 h-4 text-brand-gold" />
                              <span>View My Storefront</span>
                            </Link>
                          )}
                        </div>
                      )}

                      <div className="py-1">
                        <Link
                          href="/account/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-sand/50"
                        >
                          <Package className="w-4 h-4 text-brand-stone" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-sand/50"
                        >
                          <Heart className="w-4 h-4 text-brand-stone" />
                          <span>Saved Wishlist</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-brand-clay/40">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/customer/login"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-charcoal hover:bg-white transition-colors"
                  >
                    Customer Sign In
                  </Link>
                  <Link
                    href="/auth/owner/register"
                    className="px-3.5 py-1.5 rounded-full bg-brand-terracotta text-white text-xs font-bold hover:bg-brand-terracotta-dark shadow-subtle transition-all flex items-center gap-1.5"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Start Your Store</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Category Navigation (Reference 2 style) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-brand-clay/40 py-3 text-xs font-medium text-brand-stone">
          <div className="flex items-center gap-8">
            <Link
              href="/marketplace"
              className="text-brand-charcoal hover:text-brand-terracotta transition-colors font-semibold"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/marketplace?category=ceramics-pottery"
              className="hover:text-brand-terracotta transition-colors"
            >
              Ceramics &amp; Pottery
            </Link>
            <Link
              href="/marketplace?category=handmade-jewelry"
              className="hover:text-brand-terracotta transition-colors"
            >
              Handmade Jewelry
            </Link>
            <Link
              href="/marketplace?category=candles-scents"
              className="hover:text-brand-terracotta transition-colors"
            >
              Candles &amp; Botanicals
            </Link>
            <Link
              href="/marketplace?category=diy-craft-kits"
              className="hover:text-brand-terracotta transition-colors"
            >
              DIY Kits &amp; Crafts
            </Link>
            <Link
              href="/marketplace?category=gifts-bundles"
              className="hover:text-brand-terracotta transition-colors"
            >
              Curated Gifts
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/stores"
              className="hover:text-brand-terracotta transition-colors flex items-center gap-1 font-medium text-brand-charcoal"
            >
              <Store className="w-3.5 h-3.5 text-brand-terracotta" />
              <span>Independent Stores</span>
            </Link>
            <Link
              href="/maker-stories"
              className="hover:text-brand-terracotta transition-colors"
            >
              Maker Stories
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-clay/60 bg-brand-cream px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search marketplace..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-full border border-brand-clay"
            />
            <Search className="w-4 h-4 text-brand-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium text-brand-charcoal">
            <Link
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white"
            >
              Explore All Products
            </Link>
            <Link
              href="/marketplace?category=ceramics-pottery"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white"
            >
              Ceramics &amp; Pottery
            </Link>
            <Link
              href="/marketplace?category=handmade-jewelry"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white"
            >
              Handmade Jewelry
            </Link>
            <Link
              href="/marketplace?category=candles-scents"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white"
            >
              Candles &amp; Scents
            </Link>
            <Link
              href="/marketplace?category=diy-craft-kits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white"
            >
              DIY Craft Kits
            </Link>
            <Link
              href="/stores"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white flex items-center justify-between"
            >
              <span>Featured Storefronts</span>
              <Store className="w-4 h-4 text-brand-terracotta" />
            </Link>
            <Link
              href="/maker-stories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-white"
            >
              Maker Stories
            </Link>
          </div>

          <div className="pt-4 border-t border-brand-clay/60">
            {user ? (
              <div className="space-y-2">
                {(user.role === "SELLER" || user.role === "OWNER") && (
                  <Link
                    href="/seller/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center rounded-full bg-brand-terracotta text-white text-sm font-medium"
                  >
                    Studio Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full py-2 text-center rounded-full border border-brand-clay text-sm text-brand-charcoal"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  href="/auth/customer/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 text-center rounded-xl border border-brand-clay text-xs font-semibold text-brand-charcoal hover:bg-white"
                >
                  Customer Sign In
                </Link>
                <Link
                  href="/auth/owner/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 text-center rounded-xl bg-brand-terracotta text-white text-xs font-bold hover:bg-brand-terracotta-dark flex items-center justify-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Start Your Store</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
