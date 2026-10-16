"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, User, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { slugify } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "seller" ? "SELLER" : "CUSTOMER";

  const { register } = useAuth();

  const [role, setRole] = useState<"CUSTOMER" | "SELLER">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("role") === "seller") {
      setRole("SELLER");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await register(name, email, password, role, storeName);
    setLoading(false);

    if (res.success) {
      if (role === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/marketplace");
      }
      router.refresh();
    } else {
      setError(res.error || "Registration failed");
    }
  };

  const storeSlugPreview = storeName ? slugify(storeName) : "your-brand-slug";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-terracotta flex items-center justify-center text-white shadow-soft">
              <span className="font-serif text-xl font-bold italic">M</span>
            </div>
            <span className="font-serif text-2xl font-bold text-brand-charcoal">
              Mitti &amp; Muse
            </span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
            Join the Artisan Community
          </h1>
          <p className="text-xs text-brand-stone">
            Select your journey to begin exploring or launching your storefront.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-brand-sand/60 border border-brand-clay">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === "CUSTOMER"
                ? "bg-white text-brand-charcoal shadow-sm"
                : "text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <User className="w-4 h-4 text-brand-sage" />
            <span>I want to Shop</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("SELLER")}
            className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === "SELLER"
                ? "bg-brand-terracotta text-white shadow-sm"
                : "text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Open a Storefront</span>
          </button>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-card space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Roy"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <User className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <Mail className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Password (min 6 characters) *
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

            {/* Seller Store Name Extra Fields */}
            {role === "SELLER" && (
              <div className="p-4 rounded-2xl bg-brand-blush/60 border border-brand-clay space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal">
                  <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
                  <span>Your Artisan Brand Details</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-charcoal mb-1">
                    Storefront / Studio Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Clay &amp; Cedar Studios"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                </div>

                <div className="text-[11px] text-brand-stone">
                  Your Storefront URL will be:{" "}
                  <code className="text-brand-terracotta font-mono font-semibold">
                    mittimuse.com/store/{storeSlugPreview}
                  </code>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-xs shadow-clay flex items-center justify-center gap-2 font-bold"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>
                    {role === "SELLER" ? "Launch My Storefront" : "Create Customer Account"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-clay/50 text-center text-xs text-brand-stone">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-brand-terracotta hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs text-brand-stone">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
