"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Enquiry } from "@/types";

interface ExtendedEnquiry extends Enquiry {
  product?: { title: string; slug: string } | null;
}

export default function SellerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ExtendedEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs text-brand-stone">Loading customer inquiries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Customer Communications</span>
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
          Custom Commissions &amp; Inquiries ({enquiries.length})
        </h1>
        <p className="text-xs text-brand-stone mt-1">
          Direct messages and bespoke requests sent by patrons browsing your storefront.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-brand-stone">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            No inquiries received yet
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto">
            When patrons send custom-order commissions or ask questions about your handcrafted pieces, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-clay/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-brand-charcoal">
                    {enq.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-sage-light text-brand-sage-dark">
                    {enq.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-brand-stone">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-cream/50 border border-brand-clay/50 text-xs text-brand-charcoal leading-relaxed whitespace-pre-line">
                {enq.message}
              </div>

              {enq.product && (
                <div className="text-xs text-brand-stone flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
                  <span>Referenced creation: </span>
                  <Link
                    href={`/product/${enq.product.slug}`}
                    target="_blank"
                    className="font-bold text-brand-charcoal hover:text-brand-terracotta underline flex items-center gap-1"
                  >
                    <span>{enq.product.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-brand-clay/40 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4 text-brand-stone">
                  <span className="font-bold text-brand-charcoal">{enq.senderName}</span>
                  <a
                    href={`mailto:${enq.senderEmail}?subject=Re: ${encodeURIComponent(enq.subject)}`}
                    className="flex items-center gap-1 text-brand-terracotta hover:underline font-medium"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{enq.senderEmail}</span>
                  </a>
                  {enq.senderPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{enq.senderPhone}</span>
                    </span>
                  )}
                </div>

                <a
                  href={`mailto:${enq.senderEmail}?subject=Re: ${encodeURIComponent(enq.subject)}`}
                  className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
