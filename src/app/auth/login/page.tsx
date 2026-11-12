"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Heart, Store, ShoppingBag, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-8">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-terracotta flex items-center justify-center text-white shadow-soft">
              <span className="font-serif text-xl font-bold italic">M</span>
            </div>
            <span className="font-serif text-2xl font-bold text-brand-charcoal">
              Mitti &amp; Muse
            </span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-charcoal">
            Welcome to Mitti &amp; Muse
          </h1>
          <p className="text-xs sm:text-sm text-brand-stone max-w-md mx-auto">
            Choose your destination below to access your personal patron account or your maker studio workspace.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Customer Portal */}
          <Link
            href="/auth/customer/login"
            className="group relative clay-card rounded-[32px] p-6 sm:p-7 bg-white hover:shadow-clay-card transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-mint text-emerald-900 flex items-center justify-center shadow-clay-card border-t border-l border-white/80 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-emerald-800" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  For Shoppers &amp; Patrons
                </span>
                <h2 className="font-serif text-xl font-bold text-brand-charcoal mt-1">
                  Customer Sign In
                </h2>
                <p className="text-xs text-brand-stone mt-2 leading-relaxed">
                  Track your orders, view saved artisanal treasures, manage addresses, and support small businesses.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between font-bold text-xs text-emerald-900 group-hover:text-emerald-700 transition-colors">
              <span>Sign In as Customer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Owner Portal */}
          <Link
            href="/auth/owner/login"
            className="group relative clay-card rounded-[32px] p-6 sm:p-7 bg-white hover:shadow-clay-card transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-peach/60 text-brand-terracotta flex items-center justify-center shadow-clay-card border-t border-l border-white/80 group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6 text-brand-terracotta" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta">
                  For Makers &amp; Boutiques
                </span>
                <h2 className="font-serif text-xl font-bold text-brand-charcoal mt-1">
                  Business Owner Login
                </h2>
                <p className="text-xs text-brand-stone mt-2 leading-relaxed">
                  Manage your artisan storefront, publish handcrafted products, process orders, and review analytics.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between font-bold text-xs text-brand-terracotta group-hover:text-brand-terracotta-dark transition-colors">
              <span>Enter Owner Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-brand-stone">
            Don&apos;t have an account yet?
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <Link
              href="/auth/customer/register"
              className="text-brand-sage hover:underline flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Create Customer Account</span>
            </Link>
            <span className="text-brand-clay">•</span>
            <Link
              href="/auth/owner/register"
              className="text-brand-terracotta hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Your Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
