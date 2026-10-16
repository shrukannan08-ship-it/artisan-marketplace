"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, ProductVariant, CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number; // in cents
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "mitti_muse_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to read cart from localStorage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage on item change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [items, isLoaded]);

  const addItem = (product: Product, variant?: ProductVariant | null, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          (variant ? item.variantId === variant.id : !item.variantId)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const existing = next[existingIndex];
        const newQty = existing.quantity + quantity;
        const availableStock = variant ? variant.stock : product.stock;
        next[existingIndex] = {
          ...existing,
          quantity: Math.min(newQty, availableStock),
        };
        return next;
      }

      const newItem: CartItem = {
        id: `${product.id}-${variant?.id || "base"}-${Date.now()}`,
        productId: product.id,
        variantId: variant?.id || null,
        product,
        variant: variant || null,
        quantity: Math.max(1, quantity),
      };

      return [...prev, newItem];
    });

    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const maxStock = item.variant ? item.variant.stock : item.product.stock;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const basePrice = item.product.price;
    const delta = item.variant?.priceDelta || 0;
    return acc + (basePrice + delta) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
