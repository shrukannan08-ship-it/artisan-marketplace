import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderItemId, fulfillmentStatus, trackingNumber, shippingCourier } = await req.json();

    if (!orderItemId || !fulfillmentStatus) {
      return NextResponse.json(
        { error: "orderItemId and fulfillmentStatus are required" },
        { status: 400 }
      );
    }

    // Verify ownership
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
