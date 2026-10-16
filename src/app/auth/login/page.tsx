"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, Store, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
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
      setError(res.error || "Login failed");
    }
  };

  const handleQuickLogin = async (demoEmail: string, isSeller = false) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setLoading(true);
    setError(null);

    const res = await login(demoEmail, "Password123!");
    setLoading(false);

    if (res.success) {
      if (isSeller) {
        router.push("/seller/dashboard");
      } else {
        router.push("/marketplace");
      }
      router.refresh();
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
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
            Welcome Back
          </h1>
          <p className="text-xs text-brand-stone">
            Sign in to your customer profile or maker studio dashboard.
          </p>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="bg-brand-sand/50 rounded-2xl p-4 border border-brand-clay space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>One-Click Demonstration Logins</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("meera@mitticeramics.com", true)}
              className="p-2 rounded-xl bg-white border border-brand-clay hover:border-brand-terracotta text-left transition-all text-xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-brand-charcoal">
                <Store className="w-3 h-3 text-brand-terracotta" />
                <span>Meera (Seller)</span>
              </div>
              <p className="text-[10px] text-brand-stone mt-0.5 truncate">Mitti Ceramics</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("priya@example.com", false)}
              className="p-2 rounded-xl bg-white border border-brand-clay hover:border-brand-terracotta text-left transition-all text-xs"
            >
              <div className="flex items-center gap-1.5 font-bold text-brand-charcoal">
                <User className="w-3 h-3 text-brand-sage" />
                <span>Priya (Customer)</span>
              </div>
              <p className="text-[10px] text-brand-stone mt-0.5 truncate">Shopper / Patron</p>
            </button>
          </div>
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
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                />
                <Mail className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-brand-charcoal">
                  Password
                </label>
              </div>
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
              className="w-full btn-primary py-3 text-xs shadow-clay flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-clay/50 text-center text-xs text-brand-stone">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-brand-terracotta hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
