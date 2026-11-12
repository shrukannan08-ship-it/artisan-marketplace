"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Heart, ShoppingBag, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerLoginPage() {
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
      router.push("/marketplace");
      router.refresh();
    } else {
      setError(res.error || "Invalid customer credentials");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-terracotta to-brand-rust flex items-center justify-center text-white shadow-clay-card border-t border-l border-white/60">
              <span className="font-serif text-xl font-bold italic">M</span>
            </div>
            <span className="font-serif text-2xl font-bold text-brand-charcoal tracking-tight">
              Mitti &amp; Muse
            </span>
          </Link>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-mint text-brand-charcoal shadow-xs">
              <Heart className="w-3.5 h-3.5 text-emerald-800" />
              <span>Customer &amp; Patron Sign In</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal tracking-tight">
            Welcome Back, Patron
          </h1>
          <p className="text-xs text-brand-stone max-w-sm mx-auto leading-relaxed">
            Sign in to track orders, manage your wishlist, and support independent creators.
          </p>
        </div>

        {/* Form Card */}
        <div className="clay-card rounded-[32px] p-6 sm:p-8 space-y-5 bg-white">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <Mail className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-brand-charcoal">
                  Password
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs font-medium text-brand-terracotta hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <Lock className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full clay-pill-btn py-3 text-xs text-white flex items-center justify-center gap-2 font-bold tracking-wide"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In as Customer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-clay/30 flex flex-col items-center gap-3 text-xs text-brand-stone">
            <p>
              New customer?{" "}
              <Link
                href="/auth/customer/register"
                className="font-bold text-brand-terracotta hover:underline"
              >
                Create Customer Account
              </Link>
            </p>

            <div className="w-full pt-3 border-t border-brand-clay/30 text-center">
              <span className="text-[11px] text-brand-stone block mb-1">Are you a creative artisan?</span>
              <Link
                href="/auth/owner/login"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full clay-pill text-xs font-bold text-brand-charcoal hover:shadow-clay-card transition-all"
              >
                <Store className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Go to Business Owner Login &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
