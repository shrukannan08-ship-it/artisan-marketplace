import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "mitti_muse_super_secure_jwt_secret_key_2026_dev";
const COOKIE_NAME = "mm_token";

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: string;
  storeId?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  storeId?: string | null;
  storeSlug?: string | null;
  storeName?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user from request cookies (Server Component / Route Handler)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        store: {
          select: {
            id: true,
            slug: true,
            storeName: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.store?.id || null,
      storeSlug: user.store?.slug || null,
      storeName: user.store?.storeName || null,
    };
  } catch (error) {
    console.error("Auth getCurrentUser error:", error);
    return null;
  }
}

export function isOwner(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "OWNER" || user.role === "SELLER" || user.role === "ADMIN";
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
