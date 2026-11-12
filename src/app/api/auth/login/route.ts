import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        return NextResponse.json(
          { error: error?.message || "Invalid email or password" },
          { status: 401 }
        );
      }

      const [{ data: profile }, { data: store }] = await Promise.all([
        supabase.from("profiles").select("id, name, email, role").eq("id", data.user.id).maybeSingle(),
        supabase.from("stores").select("id, slug, store_name").eq("user_id", data.user.id).maybeSingle(),
      ]);

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          name: profile?.name ?? data.user.user_metadata?.name ?? normalizedEmail.split("@")[0],
          email: profile?.email ?? data.user.email ?? normalizedEmail,
          role: (profile?.role ?? "CUSTOMER") as UserRole,
          storeId: store?.id ?? null,
          storeSlug: store?.slug ?? null,
          storeName: store?.store_name ?? null,
        },
      });
    }
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.store?.id || null,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: user.store?.id || null,
        storeSlug: user.store?.slug || null,
        storeName: user.store?.storeName || null,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
