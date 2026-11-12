"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, CheckCircle2 } from "lucide-react";

interface CustomEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  productId?: string;
  productTitle?: string;
}

export default function CustomEnquiryModal({
  isOpen,
  onClose,
  storeId,
  storeName,
  productId,
  productTitle,
}: CustomEnquiryModalProps) {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [subject, setSubject] = useState(
    productTitle ? `Inquiry regarding "${productTitle}"` : "Custom Order Commission"
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          productId,
          senderName,
          senderEmail,
          senderPhone,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit enquiry");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative clay-card rounded-[32px] max-w-lg w-full p-6 sm:p-8 bg-white z-10 shadow-elevated">
        <div className="flex items-center justify-between pb-4 border-b border-brand-clay/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-peach/60 text-brand-terracotta flex items-center justify-center shadow-clay-card border-t border-l border-white/80">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                Direct Maker Inquiry
              </h3>
              <p className="text-xs text-brand-stone">To: {storeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-charcoal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-[22px] bg-brand-mint text-emerald-900 flex items-center justify-center mx-auto shadow-clay-card border-t border-l border-white/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl font-bold text-brand-charcoal">
              Message Sent to {storeName}!
            </h4>
            <p className="text-xs text-brand-stone max-w-xs mx-auto leading-relaxed">
              The artisan will review your inquiry and reply directly to your email address shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Maya Roy"
                  className="w-full px-4 py-2.5 text-xs clay-input rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 text-xs clay-input rounded-2xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 text-xs clay-input rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs clay-input rounded-2xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">
                Your Message / Custom Details *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your desired customizations (size, dimensions, color preferences, deadline, or special occasion)..."
                className="w-full px-4 py-2.5 text-xs clay-input rounded-2xl resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full clay-pill text-xs font-semibold text-brand-stone hover:text-brand-charcoal hover:shadow-clay-card transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="clay-pill-btn text-xs px-6 py-2.5 flex items-center gap-2"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
