import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      password,
      role = "CUSTOMER",
      storeName,
      tagline,
      description,
      location,
    } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const normalizedRole = role === "OWNER" || role === "SELLER" ? "OWNER" : "CUSTOMER";
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: String(name).trim(),
            role: normalizedRole,
            store_name: storeName ? String(storeName).trim() : undefined,
            tagline: tagline ? String(tagline).trim() : undefined,
            description: description ? String(description).trim() : undefined,
            location: location ? String(location).trim() : undefined,
          },
        },
      });

      if (error || !data.user) {
        return NextResponse.json(
          { error: error?.message || "Failed to register account" },
          { status: 400 }
        );
      }

      const [{ data: profile }, { data: store }] = await Promise.all([
        supabase.from("profiles").select("id, name, email, role").eq("id", data.user.id).maybeSingle(),
        supabase.from("stores").select("id, slug, store_name").eq("user_id", data.user.id).maybeSingle(),
      ]);

      return NextResponse.json(
        {
          success: true,
          requiresEmailConfirmation: !data.session,
          user: {
            id: data.user.id,
            name: profile?.name ?? String(name).trim(),
            email: profile?.email ?? normalizedEmail,
            role: (profile?.role ?? normalizedRole) as UserRole,
            storeId: store?.id ?? null,
            storeSlug: store?.slug ?? null,
            storeName: store?.store_name ?? null,
          },
        },
        { status: 201 }
      );
    }
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const isOwner = role === "OWNER" || role === "SELLER";
    const assignedRole = isOwner ? "OWNER" : "CUSTOMER";

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
      },
    });

    let store = null;
    if (isOwner) {
      const actualStoreName = storeName?.trim() || `${name.trim()}'s Studio`;
      let slug = slugify(actualStoreName);

      // Verify unique slug
      const existingSlug = await prisma.store.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      store = await prisma.store.create({
        data: {
          userId: user.id,
          storeName: actualStoreName,
          slug,
          tagline: tagline?.trim() || "Independent handcrafted goods & artisanal creations",
          description: description?.trim() || `Welcome to ${actualStoreName}. We craft small-batch handmade goods with love and authentic materials.`,
          location: location?.trim() || "Atelier Studio",
          primaryColor: "#C86D51",
          accentColor: "#5E8773",
          rating: 5.0,
          reviewCount: 0,
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: store?.id || null,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeId: store?.id || null,
        storeSlug: store?.slug || null,
        storeName: store?.storeName || null,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
