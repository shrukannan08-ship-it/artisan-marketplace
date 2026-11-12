"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Store, Package, Users, ShoppingBag, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

interface AdminOverview {
  profiles: { id: string; name: string; email: string; role: string; created_at: string }[];
  stores: { id: string; user_id: string; store_name: string; slug: string; location: string | null; featured: boolean }[];
  products: { id: string; title: string; slug: string; status: string; featured: boolean; price: number; stock: number }[];
  orders: { id: string; order_number: string; total_amount: number; status: string; payment_status: string; created_at: string }[];
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to load admin console");
        setOverview(null);
        return;
      }
      setOverview(data);
    } catch {
      setError("Network error while loading admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user?.role, loadData]);

  const runAction = async (payload: Record<string, unknown>, id: string) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
      } else {
        await loadData();
      }
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="clay-card p-8 text-center text-sm text-brand-stone">
          Loading platform governance console...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="clay-card p-8 space-y-4">
          <ShieldCheck className="w-10 h-10 text-brand-terracotta mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-brand-charcoal">Admin Access Required</h1>
          <p className="text-sm text-brand-stone">
            This console is restricted to Mitti &amp; Muse platform administrators.
          </p>
          <Link
            href="/"
            className="inline-block clay-pill-btn bg-brand-terracotta text-white px-6 py-2.5 text-sm font-medium"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-sage/15 text-brand-sage text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Administration
          </span>
          <h1 className="text-3xl font-serif font-bold text-brand-charcoal">
            Mitti &amp; Muse Governance Console
          </h1>
        </div>
        <button
          onClick={loadData}
          className="clay-pill px-4 py-2 text-xs font-semibold text-brand-charcoal hover:bg-white self-start"
        >
          Refresh Overview
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5 space-y-1">
          <div className="flex items-center justify-between text-brand-stone text-xs font-medium">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-brand-terracotta" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-charcoal">
            {overview?.profiles.length ?? 0}
          </p>
        </div>
        <div className="clay-card p-5 space-y-1">
          <div className="flex items-center justify-between text-brand-stone text-xs font-medium">
            <span>Maker Studios</span>
            <Store className="w-4 h-4 text-brand-sage" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-charcoal">
            {overview?.stores.length ?? 0}
          </p>
        </div>
        <div className="clay-card p-5 space-y-1">
          <div className="flex items-center justify-between text-brand-stone text-xs font-medium">
            <span>Listed Products</span>
            <Package className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-charcoal">
            {overview?.products.length ?? 0}
          </p>
        </div>
        <div className="clay-card p-5 space-y-1">
          <div className="flex items-center justify-between text-brand-stone text-xs font-medium">
            <span>Orders Processed</span>
            <ShoppingBag className="w-4 h-4 text-brand-terracotta" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-charcoal">
            {overview?.orders.length ?? 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="clay-card p-6 space-y-4">
          <h2 className="text-lg font-serif font-bold text-brand-charcoal">Maker Studios</h2>
          {!overview?.stores.length ? (
            <p className="text-sm text-brand-stone">No independent stores registered yet.</p>
          ) : (
            <div className="space-y-3">
              {overview.stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 border border-brand-clay/50"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/store/${store.slug}`}
                      className="text-sm font-semibold text-brand-charcoal hover:text-brand-terracotta truncate block"
                    >
                      {store.store_name}
                    </Link>
                    <p className="text-xs text-brand-stone truncate">
                      {store.location || "Atelier Studio"} · /{store.slug}
                    </p>
                  </div>
                  <button
                    disabled={busyId === store.id}
                    onClick={() =>
                      runAction(
                        { action: "toggle_store_featured", storeId: store.id, featured: !store.featured },
                        store.id
                      )
                    }
                    className={`clay-pill px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 ${
                      store.featured
                        ? "bg-brand-gold/25 text-brand-charcoal"
                        : "bg-white text-brand-stone"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>{store.featured ? "Featured" : "Feature"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="clay-card p-6 space-y-4">
          <h2 className="text-lg font-serif font-bold text-brand-charcoal">Curated Listings</h2>
          {!overview?.products.length ? (
            <p className="text-sm text-brand-stone">No products created yet.</p>
          ) : (
            <div className="space-y-3">
              {overview.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 border border-brand-clay/50"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-semibold text-brand-charcoal hover:text-brand-terracotta truncate block"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-brand-stone">
                      {formatCurrency(product.price)} · Stock: {product.stock} · {product.status}
                    </p>
                  </div>
                  <button
                    disabled={busyId === product.id}
                    onClick={() =>
                      runAction(
                        {
                          action: "toggle_product_featured",
                          productId: product.id,
                          featured: !product.featured,
                        },
                        product.id
                      )
                    }
                    className={`clay-pill px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1 ${
                      product.featured
                        ? "bg-brand-terracotta/15 text-brand-terracotta"
                        : "bg-white text-brand-stone"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>{product.featured ? "Featured" : "Feature"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="clay-card p-6 space-y-4">
        <h2 className="text-lg font-serif font-bold text-brand-charcoal">Accounts &amp; Roles</h2>
        {!overview?.profiles.length ? (
          <p className="text-sm text-brand-stone">No registered user profiles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-brand-clay/60 text-brand-stone">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Role</th>
                  <th className="py-2 font-semibold">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-clay/40">
                {overview.profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="py-2.5 pr-4 font-medium text-brand-charcoal">{profile.name}</td>
                    <td className="py-2.5 pr-4 text-brand-stone">{profile.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-sand text-brand-charcoal">
                        {profile.role}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <select
                        disabled={busyId === profile.id || profile.id === user.id}
                        value={profile.role}
                        onChange={(e) =>
                          runAction(
                            { action: "update_user_role", userId: profile.id, role: e.target.value },
                            profile.id
                          )
                        }
                        className="clay-input px-2.5 py-1 text-xs rounded-lg"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="OWNER">OWNER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
