import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      where: { storeId: user.storeId },
      include: {
        category: true,
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/seller/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
