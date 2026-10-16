"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Store, Sparkles, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OwnerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push("/seller/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Invalid owner credentials");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-clay/40 text-brand-terracotta-dark">
            <Store className="w-3.5 h-3.5 text-brand-terracotta" />
            <span>Studio &amp; Business Owner Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
            Welcome to Your Atelier
          </h1>
          <p className="text-xs text-brand-stone max-w-sm mx-auto">
            Log in to manage your storefront, publish genuine handcrafted products, view orders, and track your business.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-card space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Owner Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artisan@studio.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <Mail className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <Lock className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs shadow-clay flex items-center justify-center gap-2 font-bold"
            >
              {loading ? (
                <span>Verifying Access...</span>
              ) : (
                <>
                  <span>Enter Owner Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-clay/50 flex flex-col items-center gap-3 text-xs text-brand-stone">
            <p>
              Looking to sell on Mitti &amp; Muse?{" "}
              <Link
                href="/auth/owner/register"
                className="font-bold text-brand-terracotta hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Start Your Store</span>
              </Link>
            </p>

            <div className="w-full pt-3 border-t border-brand-clay/40 text-center">
              <span className="text-[11px] text-brand-stone">Looking to shop or track customer orders?</span>
              <Link
                href="/auth/customer/login"
                className="block font-semibold text-brand-charcoal hover:text-brand-terracotta mt-0.5 flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-brand-sage" />
                <span>Customer Sign In &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
