import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { name, email, password, role = "CUSTOMER", storeName } = await req.json();

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
    const assignedRole = role === "SELLER" ? "SELLER" : "CUSTOMER";

    // Create user and optionally their store if seller
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
      },
    });

    let store = null;
    if (assignedRole === "SELLER") {
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
          tagline: "Independent handcrafted goods & artisanal creations",
          description: `Welcome to ${actualStoreName}. We craft small-batch handmade goods with love and authentic materials.`,
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
