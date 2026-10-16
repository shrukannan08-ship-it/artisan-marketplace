"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Heart, ArrowRight, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#FAF4EE] border-t border-brand-clay/70 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Banner (Reference 2 style) */}
        <div className="bg-gradient-to-r from-brand-blush via-white to-brand-sand rounded-3xl p-8 sm:p-10 border border-brand-clay shadow-soft mb-16 relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-terracotta/10 text-brand-terracotta mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Our Community of Makers &amp; Seekers</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal mb-2">
              Let&apos;s Make a Kinder, More Thoughtful World
            </h3>
            <p className="text-sm text-brand-stone max-w-xl mb-6">
              Receive curated weekly maker spotlights, behind-the-scenes studio tours, secret product drops, and artisan discounts straight to your inbox.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-brand-sage-light text-brand-sage-dark text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 fill-brand-sage" />
                <span>Welcome to our maker family! Check your inbox for your 10% welcome gift.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-5 py-3 rounded-full text-sm bg-white border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/40 shadow-subtle text-brand-charcoal"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-sm font-medium shadow-clay transition-all flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-brand-terracotta flex items-center justify-center text-white shadow-soft">
                <span className="font-serif text-lg font-bold italic">M</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-charcoal">
                Mitti &amp; Muse
              </span>
            </Link>
            <p className="text-sm text-brand-stone leading-relaxed max-w-sm mb-6">
              A curated digital destination for independent artisans, women-led boutique studios, and creative entrepreneurs. Every purchase directly sustains small makers and honest craftsmanship.
            </p>
            <div className="flex items-center gap-3 text-brand-stone">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white border border-brand-clay flex items-center justify-center hover:text-brand-terracotta hover:border-brand-terracotta transition-colors shadow-subtle"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:curators@mittimuse.com"
                className="w-9 h-9 rounded-full bg-white border border-brand-clay flex items-center justify-center hover:text-brand-terracotta hover:border-brand-terracotta transition-colors shadow-subtle"
                aria-label="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-brand-charcoal mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-stone">
              <li>
                <Link href="/marketplace?category=ceramics-pottery" className="hover:text-brand-terracotta">
                  Ceramics &amp; Pottery
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=handmade-jewelry" className="hover:text-brand-terracotta">
                  Botanical Jewelry
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=candles-scents" className="hover:text-brand-terracotta">
                  Hand-poured Candles
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=diy-craft-kits" className="hover:text-brand-terracotta">
                  DIY Craft Kits
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=gifts-bundles" className="hover:text-brand-terracotta">
                  Gifts &amp; Hampers
                </Link>
              </li>
            </ul>
          </div>

          {/* For Makers & Sellers */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-brand-charcoal mb-4">
              Creative Creators
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-stone">
              <li>
                <Link href="/auth/register?role=seller" className="hover:text-brand-terracotta font-medium text-brand-terracotta">
                  Open Your Storefront
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-brand-terracotta">
                  Seller Studio Portal
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-brand-terracotta">
                  Artisan Directory
                </Link>
              </li>
              <li>
                <Link href="/maker-stories" className="hover:text-brand-terracotta">
                  Maker Spotlights
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold text-xs tracking-wider uppercase text-brand-charcoal mb-4">
              Support &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-stone">
              <li>
                <Link href="/account/orders" className="hover:text-brand-terracotta">
                  Track Your Order
                </Link>
              </li>
              <li>
                <span className="text-brand-stone/80">Plastic-Free Shipping</span>
              </li>
              <li>
                <span className="text-brand-stone/80">Artisan Guarantee</span>
              </li>
              <li>
                <span className="text-brand-stone/80">Direct Maker Enquiries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-clay/60 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-stone gap-4">
          <p>© {new Date().getFullYear()} Mitti &amp; Muse. Celebrating handmade culture and independent brands.</p>
          <div className="flex items-center gap-6">
            <span>Crafted with care</span>
            <span>•</span>
            <span>Ethical Commerce</span>
            <span>•</span>
            <span>Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
