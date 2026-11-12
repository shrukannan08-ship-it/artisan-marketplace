import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { callSupabaseEdgeFunction, createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const edgeRes = await callSupabaseEdgeFunction("admin-actions", {
        method: "GET",
        accessToken: session?.access_token,
      });

      if (edgeRes.ok && edgeRes.data) {
        return NextResponse.json(edgeRes.data);
      }

      const db = isSupabaseAdminConfigured() ? createAdminClient() : supabase;
      const [profilesRes, storesRes, productsRes, ordersRes] = await Promise.all([
        db.from("profiles").select("id, name, email, role, created_at").order("created_at", { ascending: false }).limit(50),
        db.from("stores").select("id, user_id, store_name, slug, location, featured, created_at").order("created_at", { ascending: false }).limit(50),
        db.from("products").select("id, title, slug, status, featured, price, stock, store_id").order("created_at", { ascending: false }).limit(50),
        db.from("orders").select("id, order_number, total_amount, status, payment_status, created_at").order("created_at", { ascending: false }).limit(50),
      ]);

      return NextResponse.json({
        profiles: profilesRes.data ?? [],
        stores: storesRes.data ?? [],
        products: productsRes.data ?? [],
        orders: ordersRes.data ?? [],
      });
    }

    const [profiles, stores, products, orders] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.store.findMany({
        select: { id: true, userId: true, storeName: true, slug: true, location: true, featured: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.product.findMany({
        select: { id: true, title: true, slug: true, status: true, featured: true, price: true, stock: true, storeId: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.order.findMany({
        select: { id: true, orderNumber: true, totalAmount: true, status: true, paymentStatus: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      profiles: profiles.map((p) => ({ ...p, created_at: p.createdAt })),
      stores: stores.map((s) => ({
        id: s.id,
        user_id: s.userId,
        store_name: s.storeName,
        slug: s.slug,
        location: s.location,
        featured: s.featured,
        created_at: s.createdAt,
      })),
      products: products.map((p) => ({
        ...p,
        store_id: p.storeId,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        order_number: o.orderNumber,
        total_amount: o.totalAmount,
        status: o.status,
        payment_status: o.paymentStatus,
        created_at: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, storeId, productId, userId, featured, role } = body ?? {};

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const edgeRes = await callSupabaseEdgeFunction("admin-actions", {
        method: "POST",
        body,
        accessToken: session?.access_token,
      });

      if (edgeRes.ok && edgeRes.data) {
        return NextResponse.json(edgeRes.data);
      }

      const db = isSupabaseAdminConfigured() ? createAdminClient() : supabase;

      if (action === "toggle_store_featured" && storeId) {
        const { data, error } = await db
          .from("stores")
          .update({ featured: Boolean(featured) })
          .eq("id", storeId)
          .select("id, featured")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, store: data });
      }

      if (action === "toggle_product_featured" && productId) {
        const { data, error } = await db
          .from("products")
          .update({ featured: Boolean(featured) })
          .eq("id", productId)
          .select("id, featured")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, product: data });
      }

      if (action === "update_user_role" && userId && role) {
        if (userId === user.id && role !== "ADMIN") {
          return NextResponse.json({ error: "Cannot demote your own admin account" }, { status: 400 });
        }
        const { data, error } = await db
          .from("profiles")
          .update({ role })
          .eq("id", userId)
          .select("id, role")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, profile: data });
      }

      return NextResponse.json({ error: "Unsupported admin action" }, { status: 400 });
    }

    if (action === "toggle_store_featured" && storeId) {
      const store = await prisma.store.update({
        where: { id: storeId },
        data: { featured: Boolean(featured) },
      });
      return NextResponse.json({ success: true, store });
    }

    if (action === "toggle_product_featured" && productId) {
      const product = await prisma.product.update({
        where: { id: productId },
        data: { featured: Boolean(featured) },
      });
      return NextResponse.json({ success: true, product });
    }

    if (action === "update_user_role" && userId && role) {
      if (userId === user.id && role !== "ADMIN") {
        return NextResponse.json({ error: "Cannot demote your own admin account" }, { status: 400 });
      }
      const profile = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json({ error: "Unsupported admin action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin error:", error);
    return NextResponse.json({ error: "Admin action failed" }, { status: 500 });
  }
}
