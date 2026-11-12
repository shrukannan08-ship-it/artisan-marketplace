import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient as createSupabaseServerClient } from "./supabase/server";
import type { UserRole, UserSession } from "@/types";

export const AUTH_COOKIE_NAME = "mm_token";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable must be at least 16 characters.");
    }
    return "mitti-muse-local-dev-secret-change-me";
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("id", user.id)
        .single();

      const { data: store } = await supabase
        .from("stores")
        .select("id, slug, store_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const fallbackRole =
        String(user.user_metadata?.role ?? "CUSTOMER").toUpperCase() === "SELLER" ||
        String(user.user_metadata?.role ?? "CUSTOMER").toUpperCase() === "OWNER"
          ? "OWNER"
          : "CUSTOMER";

      return {
        id: user.id,
        name: profile?.name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Maker",
        email: profile?.email ?? user.email ?? "",
        role: (profile?.role ?? fallbackRole) as UserRole,
        storeId: store?.id ?? null,
        storeSlug: store?.slug ?? null,
        storeName: store?.store_name ?? null,
      };
    } catch {
      return null;
    }
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { store: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      storeId: user.store?.id ?? null,
      storeSlug: user.store?.slug ?? null,
      storeName: user.store?.storeName ?? null,
    };
  } catch {
    return null;
  }
}

export function isOwner(user: UserSession | null): boolean {
  return Boolean(user && (user.role === "OWNER" || user.role === "SELLER" || user.role === "ADMIN"));
}
