"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Palette,
  ExternalLink,
  Sparkles,
  Save,
  CheckCircle2,
  Instagram,
  MapPin,
} from "lucide-react";
import { Store } from "@/types";

export default function SellerStorefrontPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [craftsmanship, setCraftsmanship] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [policyShipping, setPolicyShipping] = useState("");
  const [policyReturns, setPolicyReturns] = useState("");

  const fetchStore = async () => {
    try {
      const res = await fetch("/api/seller/storefront");
      if (res.ok) {
        const data = await res.json();
        const s = data.store;
        setStore(s);
        if (s) {
          setStoreName(s.storeName || "");
          setTagline(s.tagline || "");
          setLocation(s.location || "");
          setDescription(s.description || "");
          setStory(s.story || "");
          setCraftsmanship(s.craftsmanship || "");
          setBannerUrl(s.bannerUrl || "");
          setLogoUrl(s.logoUrl || "");
          setInstagram(s.instagram || "");
          setPolicyShipping(s.policyShipping || "");
          setPolicyReturns(s.policyReturns || "");
        }
      }
    } catch (err) {
      console.error("Failed to load storefront details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/seller/storefront", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          tagline,
          location,
          description,
          story,
          craftsmanship,
          bannerUrl,
          logoUrl,
          instagram,
          policyShipping,
          policyReturns,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update storefront");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while saving storefront");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs text-brand-stone">Loading studio storefront customizer...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Storefront Brand Identity</span>
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
            Storefront Customizer
          </h1>
          <p className="text-xs text-brand-stone mt-1">
            Customize your banner, logo, brand philosophy, and maker story.
          </p>
        </div>

        {store && (
          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="clay-pill text-xs px-5 py-2.5 font-bold text-brand-charcoal hover:shadow-clay-card flex items-center gap-1.5 transition-all"
          >
            <span>Live Public Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-terracotta" />
          </Link>
        )}
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-brand-mint text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Your storefront changes have been saved and published live!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Banner & Logo Visual Identity */}
        <div className="clay-card rounded-[32px] p-6 sm:p-8 space-y-6 bg-white">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/30">
            Visual Brand Assets
          </h2>

          {/* Banner Preview */}
          <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-brand-sand clay-card p-1">
            <div className="relative w-full h-full rounded-[14px] overflow-hidden">
              {bannerUrl ? (
                <Image src={bannerUrl} alt="Store banner preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-stone font-medium">
                  Banner Image Preview
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                Store Banner URL (HTTPS)
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                Logo / Avatar URL (HTTPS)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              />
            </div>
          </div>
        </div>

        {/* Brand Profile Details */}
        <div className="clay-card rounded-[32px] p-6 sm:p-8 space-y-5 bg-white">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/30">
            Brand Profile &amp; Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                Storefront Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                Studio Location (City, Country)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Jaipur, India or Portland, OR"
                className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Brand Tagline (one catchy sentence)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Earthy stoneware shaped by hand, touched by warmth"
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Short Bio / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Instagram Handle
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourbrand"
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>
        </div>

        {/* Maker Story & Craft Ethics */}
        <div className="clay-card rounded-[32px] p-6 sm:p-8 space-y-5 bg-white">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/30">
            Maker Story &amp; Craftsmanship
          </h2>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              The Maker&apos;s Story (History, motivation, origins)
            </label>
            <textarea
              rows={5}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell patrons why you began this craft, your inspiration, and your journey..."
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Craftsmanship Details &amp; Material Ethics
            </label>
            <textarea
              rows={3}
              value={craftsmanship}
              onChange={(e) => setCraftsmanship(e.target.value)}
              placeholder="Describe your raw materials, firing temps, sustainable sourcing, or zero-waste methods..."
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 resize-none"
            />
          </div>
        </div>

        {/* Shipping & Policies */}
        <div className="clay-card rounded-[32px] p-6 sm:p-8 space-y-5 bg-white">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/30">
            Store Policies
          </h2>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Shipping &amp; Packaging Policy
            </label>
            <input
              type="text"
              value={policyShipping}
              onChange={(e) => setPolicyShipping(e.target.value)}
              placeholder="e.g. Dispatches within 2 business days in plastic-free packaging."
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Returns &amp; Exchanges Policy
            </label>
            <input
              type="text"
              value={policyReturns}
              onChange={(e) => setPolicyReturns(e.target.value)}
              placeholder="e.g. 14-day returns accepted for unused items in original packaging."
              className="w-full px-4 py-2.5 text-xs rounded-xl clay-input focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="clay-pill-btn text-xs px-8 py-3.5 text-white flex items-center gap-2 font-bold tracking-wide"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Storefront Identity</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
