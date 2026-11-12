import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { type DbRow, mapOrderItem } from "@/lib/supabase/mappers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: rows, error } = await supabase
        .from("order_items")
        .select(`
          *,
          orders (
            id,
            order_number,
            status,
            shipping_address,
            created_at,
            guest_name,
            guest_email,
            profiles:user_id (name, email)
          ),
          products (
            *,
            product_images (*)
          )
        `)
        .eq("store_id", user.storeId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
      }

      const orderItems = ((rows ?? []) as DbRow[]).map((row) => {
        const ord = row.orders as DbRow | null | undefined;
        return {
          ...mapOrderItem(row),
          createdAt: row.created_at,
          order: ord
            ? {
                id: ord.id,
                orderNumber: ord.order_number,
                status: ord.status,
                shippingAddress: ord.shipping_address,
                createdAt: ord.created_at,
                guestName: ord.guest_name,
                guestEmail: ord.guest_email,
                user: ord.profiles ?? null,
              }
            : undefined,
        };
      });

      return NextResponse.json({ orderItems });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { storeId: user.storeId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            shippingAddress: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
            guestName: true,
            guestEmail: true,
          },
        },
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orderItems });
  } catch (error) {
    console.error("GET /api/seller/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderItemId, fulfillmentStatus, trackingNumber, shippingCourier } = await req.json();

    if (!orderItemId || !fulfillmentStatus) {
      return NextResponse.json(
        { error: "orderItemId and fulfillmentStatus are required" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: item } = await supabase
        .from("order_items")
        .select("*")
        .eq("id", orderItemId)
        .maybeSingle();

      if (!item || item.store_id !== user.storeId) {
        return NextResponse.json(
          { error: "Forbidden: You cannot modify orders for another store" },
          { status: 403 }
        );
      }

      const { data: updated, error } = await supabase
        .from("order_items")
        .update({
          fulfillment_status: fulfillmentStatus,
          tracking_number: trackingNumber ?? item.tracking_number,
          shipping_courier: shippingCourier ?? item.shipping_courier,
        })
        .eq("id", orderItemId)
        .eq("store_id", user.storeId)
        .select("*")
        .single();

      if (error || !updated) {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      return NextResponse.json({ success: true, item: mapOrderItem(updated) });
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!item || item.storeId !== user.storeId) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify orders for another store" },
        { status: 403 }
      );
    }

    const updated = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        fulfillmentStatus,
        trackingNumber: trackingNumber ?? item.trackingNumber,
        shippingCourier: shippingCourier ?? item.shippingCourier,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("PATCH /api/seller/orders error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
