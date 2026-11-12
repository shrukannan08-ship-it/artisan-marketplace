"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CartItem, Product, ProductVariant } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { type DbRow, mapProduct, mapProductVariant } from "@/lib/supabase/mappers";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "mitti_muse_cart_v1";

async function ensureUserCartId(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) return null;
  return created.id;
}

async function fetchDbCartItems(cartId: string): Promise<CartItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      product_id,
      variant_id,
      quantity,
      products (
        *,
        stores (*),
        categories (*),
        product_images (*),
        product_variants (*)
      ),
      product_variants (*)
    `)
    .eq("cart_id", cartId);

  if (error || !data) return [];

  return (data as DbRow[])
    .filter((row) => Boolean(row.products && typeof row.products === "object"))
    .map((row) => {
      const product = mapProduct(row.products as DbRow);
      const variant =
        row.product_variants && typeof row.product_variants === "object"
          ? mapProductVariant(row.product_variants as DbRow)
          : null;
      return {
        id: String(row.id),
        productId: String(row.product_id),
        variantId: typeof row.variant_id === "string" ? row.variant_id : null,
        quantity: Number(row.quantity ?? 1),
        product,
        variant,
      };
    });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [dbCartId, setDbCartId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch {
      // Ignore storage parsing errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items, hydrated]);

  // Sync guest cart to Supabase PostgreSQL cart when authenticated
  useEffect(() => {
    if (!hydrated || !isSupabaseConfigured() || !user?.id) {
      setDbCartId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const cartId = await ensureUserCartId(user.id);
      if (!cartId || cancelled) return;
      setDbCartId(cartId);

      const supabase = createClient();
      const { data: existingRows } = await supabase
        .from("cart_items")
        .select("id, product_id, variant_id, quantity")
        .eq("cart_id", cartId);

      const currentDbRows = existingRows ?? [];

      // Merge any locally held guest items into database cart
      for (const localItem of items) {
        const match = currentDbRows.find(
          (r) =>
            r.product_id === localItem.productId &&
            (r.variant_id ?? null) === (localItem.variantId ?? null)
        );
        if (!match) {
          await supabase.from("cart_items").insert({
            cart_id: cartId,
            product_id: localItem.productId,
            variant_id: localItem.variantId ?? null,
            quantity: localItem.quantity,
          });
        }
      }

      const dbItems = await fetchDbCartItems(cartId);
      if (!cancelled && dbItems.length > 0) {
        setItems(dbItems);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally triggered on user sign-in after initial local hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hydrated]);

  const syncCartMutation = useCallback(
    async (
      op:
        | { type: "upsert"; productId: string; variantId: string | null; quantity: number }
        | { type: "remove"; productId: string; variantId: string | null }
        | { type: "clear" }
    ) => {
      if (!isSupabaseConfigured() || !dbCartId) return;
      const supabase = createClient();

      if (op.type === "clear") {
        await supabase.from("cart_items").delete().eq("cart_id", dbCartId);
        return;
      }

      let query = supabase
        .from("cart_items")
        .select("id")
        .eq("cart_id", dbCartId)
        .eq("product_id", op.productId);

      query = op.variantId ? query.eq("variant_id", op.variantId) : query.is("variant_id", null);
      const { data: existing } = await query.maybeSingle();

      if (op.type === "remove") {
        if (existing?.id) {
          await supabase.from("cart_items").delete().eq("id", existing.id);
        }
        return;
      }

      if (existing?.id) {
        await supabase
          .from("cart_items")
          .update({ quantity: op.quantity })
          .eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({
          cart_id: dbCartId,
          product_id: op.productId,
          variant_id: op.variantId,
          quantity: op.quantity,
        });
      }
    },
    [dbCartId]
  );

  const addItem = useCallback(
    (product: Product, variant?: ProductVariant | null, quantity = 1) => {
      const variantId = variant?.id || null;
      const maxStock = variant ? variant.stock : product.stock;

      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === product.id && (i.variantId || null) === variantId
        );
        let nextQty = quantity;
        if (idx > -1) {
          const updated = [...prev];
          nextQty = Math.min(updated[idx].quantity + quantity, Math.max(1, maxStock));
          updated[idx] = { ...updated[idx], quantity: nextQty };
          void syncCartMutation({ type: "upsert", productId: product.id, variantId, quantity: nextQty });
          return updated;
        }
        nextQty = Math.min(quantity, Math.max(1, maxStock));
        void syncCartMutation({ type: "upsert", productId: product.id, variantId, quantity: nextQty });
        return [
          ...prev,
          {
            id: `${product.id}_${variantId || "default"}`,
            productId: product.id,
            variantId,
            quantity: nextQty,
            product,
            variant: variant || null,
          },
        ];
      });
      setIsCartDrawerOpen(true);
    },
    [syncCartMutation]
  );

  const removeItem = useCallback(
    (productId: string, variantId?: string | null) => {
      const normalizedVariant = variantId || null;
      setItems((prev) =>
        prev.filter((i) => !(i.productId === productId && (i.variantId || null) === normalizedVariant))
      );
      void syncCartMutation({ type: "remove", productId, variantId: normalizedVariant });
    },
    [syncCartMutation]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string | null) => {
      const normalizedVariant = variantId || null;
      if (quantity <= 0) {
        removeItem(productId, normalizedVariant);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.productId === productId && (item.variantId || null) === normalizedVariant) {
            const maxStock = item.variant ? item.variant.stock : item.product.stock;
            const boundedQty = Math.min(quantity, Math.max(1, maxStock));
            void syncCartMutation({
              type: "upsert",
              productId,
              variantId: normalizedVariant,
              quantity: boundedQty,
            });
            return { ...item, quantity: boundedQty };
          }
          return item;
        })
      );
    },
    [removeItem, syncCartMutation]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    void syncCartMutation({ type: "clear" });
  }, [syncCartMutation]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.product.price + (item.variant?.priceDelta || 0);
    return acc + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
