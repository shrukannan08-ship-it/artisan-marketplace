"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserRole, UserSession } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "OWNER" | "SELLER",
    storeName?: string,
    extraStoreData?: { tagline?: string; description?: string; location?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadSupabaseUserSession(authUser: User | null): Promise<UserSession | null> {
  if (!authUser) return null;
  const supabase = createClient();

  const [{ data: profile }, { data: store }] = await Promise.all([
    supabase.from("profiles").select("id, name, email, role").eq("id", authUser.id).maybeSingle(),
    supabase.from("stores").select("id, slug, store_name").eq("user_id", authUser.id).maybeSingle(),
  ]);

  const rawMetaRole = String(authUser.user_metadata?.role ?? "CUSTOMER").toUpperCase();
  const fallbackRole: UserRole =
    rawMetaRole === "OWNER" || rawMetaRole === "SELLER" ? "OWNER" : "CUSTOMER";

  return {
    id: authUser.id,
    name: profile?.name ?? authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? "User",
    email: profile?.email ?? authUser.email ?? "",
    role: (profile?.role ?? fallbackRole) as UserRole,
    storeId: store?.id ?? null,
    storeSlug: store?.slug ?? null,
    storeName: store?.store_name ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        const sessionUser = await loadSupabaseUserSession(authUser);
        setUser(sessionUser);
        return;
      }

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadSupabaseUserSession(session?.user ?? null)
        .then((sessionUser) => setUser(sessionUser))
        .catch(() => setUser(null));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          return { success: false, error: error.message || "Invalid email or password" };
        }
        const sessionUser = await loadSupabaseUserSession(data.user);
        setUser(sessionUser);
        return { success: true };
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "CUSTOMER" | "OWNER" | "SELLER",
    storeName?: string,
    extraStoreData?: { tagline?: string; description?: string; location?: string }
  ) => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const normalizedRole = role === "OWNER" || role === "SELLER" ? "OWNER" : "CUSTOMER";
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              name: name.trim(),
              role: normalizedRole,
              store_name: storeName?.trim() || undefined,
              tagline: extraStoreData?.tagline?.trim() || undefined,
              description: extraStoreData?.description?.trim() || undefined,
              location: extraStoreData?.location?.trim() || undefined,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message || "Registration failed" };
        }

        if (!data.session) {
          return {
            success: false,
            error: "Account created! Please check your email confirmation link before signing in.",
          };
        }

        // Wait briefly for the PostgreSQL handle_new_user trigger to commit profile + store rows
        const sessionUser = await loadSupabaseUserSession(data.user);
        setUser(sessionUser);
        return { success: true };
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, storeName, ...extraStoreData }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      } else {
        await fetch("/api/auth/logout", { method: "POST" });
      }
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
