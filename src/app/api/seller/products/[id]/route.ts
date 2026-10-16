import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    if (!product || product.storeId !== user.storeId) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/seller/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.storeId !== user.storeId) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      price,
      compareAtPrice,
      stock,
      status,
      tags,
      craftDetails,
      careInstructions,
      imageUrl,
    } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        description: description !== undefined ? description : existing.description,
        categoryId: categoryId || existing.categoryId,
        price: price !== undefined ? Math.round(Number(price) * 100) : existing.price,
        compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null) : existing.compareAtPrice,
        stock: stock !== undefined ? Number(stock) : existing.stock,
        status: status || existing.status,
        tags: tags !== undefined ? tags : existing.tags,
        craftDetails: craftDetails !== undefined ? craftDetails : existing.craftDetails,
        careInstructions: careInstructions !== undefined ? careInstructions : existing.careInstructions,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    if (imageUrl) {
      // update primary image
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.create({
        data: {
          productId: id,
          url: imageUrl,
          altText: updated.title,
          isPrimary: true,
          order: 0,
        },
      });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("PUT /api/seller/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.storeId !== user.storeId) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/seller/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
