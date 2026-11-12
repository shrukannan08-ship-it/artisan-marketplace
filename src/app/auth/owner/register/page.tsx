"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Store, MapPin, Sparkles, ShoppingBag, Feather } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Step state: 1 = Personal / Credentials, 2 = Studio Profile
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError("Please fill out all required fields");
      return;
    }

    // Auto-populate default studio name if empty
    if (!storeName) {
      setStoreName(`${name.trim()}'s Studio`);
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError("Please provide your studio or brand name");
      return;
    }

    setLoading(true);
    const res = await register(
      name,
      email,
      password,
      "OWNER",
      storeName.trim(),
      {
        tagline: tagline.trim() || "Independent handcrafted goods & artisanal creations",
        location: location.trim() || "Artisan Workshop",
        description: description.trim() || `Welcome to ${storeName.trim()}. We craft small-batch handmade goods with love and authentic materials.`,
      }
    );
    setLoading(false);

    if (res.success) {
      router.push("/seller/dashboard");
      router.refresh();
    } else {
      setError(res.error || "Failed to create business owner account");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
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
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-butter text-brand-charcoal shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>Start Your Independent Brand</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal tracking-tight">
            {step === 1 ? "Create Your Artisan Account" : "Craft Your Studio Identity"}
          </h1>
          <p className="text-xs text-brand-stone max-w-md mx-auto leading-relaxed">
            {step === 1
              ? "Join our curated collective of independent makers, small fashion labels, ceramists, and craftspeople."
              : "Tell patrons the story behind your brand, your craft specialization, and studio location."}
          </p>
        </div>

        {/* Progress Pills */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all ${
              step === 1
                ? "clay-pill-btn text-white"
                : "clay-pill text-brand-charcoal hover:shadow-clay-card"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">1</span>
            <span>Artisan Credentials</span>
          </button>
          <div className="w-6 h-[1.5px] bg-brand-clay/60" />
          <div
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all ${
              step === 2
                ? "clay-pill-btn text-white"
                : "clay-pill text-brand-stone hover:shadow-clay-card"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-brand-clay/60 flex items-center justify-center text-[10px] text-brand-charcoal">2</span>
            <span>Studio Profile</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="clay-card rounded-[32px] p-6 sm:p-8 space-y-5 bg-white">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200 font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                  Founder / Artisan Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Tara Sen"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                  <User className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                  Business / Studio Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tara@clayatelier.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                  <Mail className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                    />
                    <Lock className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                    />
                    <Lock className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full clay-pill-btn py-3 text-xs text-white flex items-center justify-center gap-2 font-bold tracking-wide"
              >
                <span>Continue to Studio Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                  Brand / Studio Name <span className="text-brand-terracotta">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="E.g., Tara Earth Studio"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                  />
                  <Store className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                    Tagline
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="E.g., Handcrafted Stoneware & Clay Art"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                    />
                    <Sparkles className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                    Studio Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="E.g., Jaipur, India"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
                    />
                    <MapPin className="w-4 h-4 text-brand-stone absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                  Craft Story &amp; Brand Philosophy
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share what makes your craft unique, your materials, techniques, and artisanal vision..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 resize-none"
                  />
                  <Feather className="w-4 h-4 text-brand-stone absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-xs rounded-full clay-pill font-bold text-brand-charcoal hover:shadow-clay-card"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 clay-pill-btn py-2.5 text-xs text-white flex items-center justify-center gap-2 font-bold tracking-wide"
                >
                  {loading ? (
                    <span>Opening Your Studio...</span>
                  ) : (
                    <>
                      <span>Launch Brand &amp; Open Atelier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-brand-clay/30 flex flex-col items-center gap-3 text-xs text-brand-stone">
            <p>
              Already registered as a business owner?{" "}
              <Link
                href="/auth/owner/login"
                className="font-bold text-brand-terracotta hover:underline"
              >
                Owner Login
              </Link>
            </p>

            <div className="w-full pt-3 border-t border-brand-clay/30 text-center">
              <span className="text-[11px] text-brand-stone block mb-1">Looking to shop or track customer orders?</span>
              <Link
                href="/auth/customer/login"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full clay-pill text-xs font-bold text-brand-charcoal hover:shadow-clay-card transition-all"
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
