import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json(
        { error: "Unauthorized. Seller account required." },
        { status: 403 }
      );
    }

    const storeId = user.storeId;

    // 1. Fetch seller's order items
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

    // Calculate real revenue from seller's items
    const totalRevenueCents = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);

    // Unique orders count
    const uniqueOrderIds = new Set(orderItems.map((item) => item.orderId));
    const totalOrdersCount = uniqueOrderIds.size;

    // Fulfillment counts
    const pendingOrdersCount = orderItems.filter(
      (item) => item.fulfillmentStatus === "PENDING" || item.fulfillmentStatus === "PROCESSING"
    ).length;

    // 2. Fetch products
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

    // 3. Recent orders list
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
