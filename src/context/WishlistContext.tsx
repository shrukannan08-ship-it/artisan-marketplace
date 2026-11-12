"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { type DbRow, mapProduct } from "@/lib/supabase/mappers";

interface WishlistContextType {
  wishlistProducts: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = "mitti_muse_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        setWishlistProducts(JSON.parse(raw));
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistProducts));
    } catch {
      // Ignore storage errors
    }
  }, [wishlistProducts, hydrated]);

  // Sync wishlist with Supabase wishlist_items for signed-in users
  useEffect(() => {
    if (!hydrated || !isSupabaseConfigured() || !user?.id) return;

    let cancelled = false;
    (async () => {
      const supabase = createClient();

      // Push local items if not already persisted
      for (const prod of wishlistProducts) {
        await supabase
          .from("wishlist_items")
          .upsert({ user_id: user.id, product_id: prod.id }, { onConflict: "user_id,product_id" });
      }

      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          product_id,
          products (
            *,
            stores (*),
            categories (*),
            product_images (*),
            product_variants (*)
          )
        `)
        .eq("user_id", user.id);

      if (!cancelled && !error && data) {
        const products = (data as DbRow[])
          .filter((row) => Boolean(row.products && typeof row.products === "object"))
          .map((row) => mapProduct(row.products as DbRow));
        setWishlistProducts(products);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hydrated]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistProducts.some((p) => p.id === productId),
    [wishlistProducts]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const currentlyIn = wishlistProducts.some((p) => p.id === product.id);
      setWishlistProducts((prev) =>
        currentlyIn ? prev.filter((p) => p.id !== product.id) : [...prev, product]
      );

      if (isSupabaseConfigured() && user?.id) {
        const supabase = createClient();
        if (currentlyIn) {
          void supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", product.id);
        } else {
          void supabase
            .from("wishlist_items")
            .upsert({ user_id: user.id, product_id: product.id }, { onConflict: "user_id,product_id" });
        }
      }
    },
    [wishlistProducts, user?.id]
  );

  const clearWishlist = useCallback(() => {
    setWishlistProducts([]);
    if (isSupabaseConfigured() && user?.id) {
      const supabase = createClient();
      void supabase.from("wishlist_items").delete().eq("user_id", user.id);
    }
  }, [user?.id]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistProducts,
        wishlistCount: wishlistProducts.length,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
