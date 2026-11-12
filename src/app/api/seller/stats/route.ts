import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json(
        { error: "Unauthorized. Business owner account required." },
        { status: 403 }
      );
    }

    const storeId = user.storeId;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      const [{ data: orderItems }, { data: products }] = await Promise.all([
        supabase
          .from("order_items")
          .select(`
            *,
            orders (
              order_number,
              created_at,
              guest_name,
              guest_email,
              profiles:user_id (name, email)
            )
          `)
          .eq("store_id", storeId)
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select(`
            *,
            product_images (*)
          `)
          .eq("store_id", storeId)
          .order("created_at", { ascending: false }),
      ]);

      const items = orderItems ?? [];
      const prods = products ?? [];

      const totalRevenueCents = items.reduce((acc, item) => acc + Number(item.total_price ?? 0), 0);
      const uniqueOrderIds = new Set(items.map((item) => item.order_id));
      const totalOrdersCount = uniqueOrderIds.size;
      const pendingOrdersCount = items.filter(
        (item) => item.fulfillment_status === "PENDING" || item.fulfillment_status === "PROCESSING"
      ).length;

      const activeProductsCount = prods.filter((p) => p.status === "ACTIVE").length;
      const lowStockProducts = prods.filter(
        (p) => Number(p.stock) <= Number(p.low_stock_threshold ?? 3) && Number(p.stock) > 0
      );
      const outOfStockProducts = prods.filter((p) => Number(p.stock) === 0);

      const recentOrders = items.slice(0, 5).map((item: Record<string, unknown>) => {
        const ord = item.orders as Record<string, unknown> | null | undefined;
        const prof = ord?.profiles as Record<string, unknown> | null | undefined;
        return {
          id: item.id,
          orderId: item.order_id,
          orderNumber: ord?.order_number ?? "MM-ORDER",
          productTitle: item.product_title,
          variantName: item.variant_name,
          unitPrice: item.unit_price,
          quantity: item.quantity,
          totalPrice: item.total_price,
          fulfillmentStatus: item.fulfillment_status,
          createdAt: item.created_at,
          customerName: prof?.name || ord?.guest_name || "Customer",
        };
      });

      return NextResponse.json({
        metrics: {
          totalRevenueCents,
          totalOrdersCount,
          pendingOrdersCount,
          activeProductsCount,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
        },
        recentOrders,
        lowStockProducts: lowStockProducts.map((p: Record<string, unknown>) => {
          const imgs = Array.isArray(p.product_images)
            ? (p.product_images as Record<string, unknown>[])
            : [];
          const primary = imgs.find((img) => Boolean(img.is_primary)) ?? imgs[0];
          return {
            id: p.id,
            title: p.title,
            stock: p.stock,
            lowStockThreshold: p.low_stock_threshold,
            price: p.price,
            imageUrl: primary?.url,
          };
        }),
      });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { storeId },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            user: {
              select: { name: true, email: true },
            },
            guestName: true,
            guestEmail: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenueCents = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const uniqueOrderIds = new Set(orderItems.map((item) => item.orderId));
    const totalOrdersCount = uniqueOrderIds.size;
    const pendingOrdersCount = orderItems.filter(
      (item) => item.fulfillmentStatus === "PENDING" || item.fulfillmentStatus === "PROCESSING"
    ).length;

    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeProductsCount = products.filter((p) => p.status === "ACTIVE").length;
    const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
    const outOfStockProducts = products.filter((p) => p.stock === 0);

    const recentOrders = orderItems.slice(0, 5).map((item) => ({
      id: item.id,
      orderId: item.orderId,
      orderNumber: item.order.orderNumber,
      productTitle: item.productTitle,
      variantName: item.variantName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      fulfillmentStatus: item.fulfillmentStatus,
      createdAt: item.createdAt,
      customerName: item.order.user?.name || item.order.guestName || "Customer",
    }));

    return NextResponse.json({
      metrics: {
        totalRevenueCents,
        totalOrdersCount,
        pendingOrdersCount,
        activeProductsCount,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      recentOrders,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        title: p.title,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        price: p.price,
        imageUrl: p.images[0]?.url,
      })),
    });
  } catch (error) {
    console.error("GET /api/seller/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller analytics" },
      { status: 500 }
    );
  }
}
