"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Check,
} from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/seller/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (productId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: nextStatus as "ACTIVE" | "DRAFT" } : p))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs text-brand-stone">Loading your studio catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
            Inventory &amp; Listings
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
            Product Catalog ({products.length})
          </h1>
          <p className="text-xs text-brand-stone mt-1">
            Manage your artisanal creations, variants, and real-time inventory levels.
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="clay-pill-btn text-xs px-6 py-2.5 text-white font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </Link>
      </div>

      {/* Catalog Table */}
      {products.length === 0 ? (
        <div className="clay-card rounded-[32px] p-12 text-center space-y-4 bg-white">
          <div className="w-16 h-16 rounded-[22px] bg-brand-butter flex items-center justify-center mx-auto text-amber-800 shadow-clay-card border-t border-l border-white/80">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            No products listed yet
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto leading-relaxed">
            Your studio catalog is currently empty. Click &ldquo;Add New Creation&rdquo; to publish your first handcrafted piece!
          </p>
          <Link href="/seller/products/new" className="clay-pill-btn text-xs px-6 py-2.5 text-white font-bold inline-block">
            Create First Product
          </Link>
        </div>
      ) : (
        <div className="clay-card rounded-[32px] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-cream/60 border-b border-brand-clay/30 text-brand-stone uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Product</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Price</th>
                  <th className="py-3.5 px-4 font-bold">Stock Level</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-clay/20">
                {products.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;
                  return (
                    <tr key={p.id} className="hover:bg-brand-cream/20 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-sand shrink-0 shadow-xs">
                            {p.images[0]?.url ? (
                              <Image
                                src={p.images[0].url}
                                alt={p.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">
                                🎨
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold font-serif text-brand-charcoal text-sm line-clamp-1">
                              {p.title}
                            </p>
                            {p.variants && p.variants.length > 0 && (
                              <p className="text-[10px] text-brand-stone font-medium">
                                {p.variants.length} options ({p.variants.map((v) => v.option).join(", ")})
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-brand-stone font-medium">
                        {p.category?.name || "Craft"}
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-brand-charcoal">
                        {formatCurrency(p.price)}
                      </td>

                      {/* Stock Level with Quick Adjust */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={p.stock}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val !== p.stock) {
                                handleUpdateStock(p.id, val);
                              }
                            }}
                            className={`w-16 px-2 py-1 text-center font-bold text-xs rounded-xl clay-input ${
                              isLow
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : "text-brand-charcoal"
                            }`}
                          />
                          {isLow && (
                            <span title="Low stock warning">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-xs ${
                            p.status === "ACTIVE"
                              ? "bg-brand-mint text-emerald-900 hover:bg-emerald-200"
                              : "clay-pill text-brand-stone hover:text-brand-charcoal"
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="w-8 h-8 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-brand-terracotta transition-colors"
                            title="View public page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="w-8 h-8 rounded-full clay-circle-btn flex items-center justify-center text-brand-stone hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete creation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
