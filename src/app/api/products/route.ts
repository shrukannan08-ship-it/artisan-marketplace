import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const store = searchParams.get("store") || "";
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featured = searchParams.get("featured");

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: "ACTIVE",
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (store) {
      where.store = { slug: store };
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice) * 100;
      if (maxPrice) where.price.lte = parseInt(maxPrice) * 100;
    }

    // Sort order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        store: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            rating: true,
            reviewCount: true,
            logoUrl: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        variants: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json(
        { error: "Unauthorized. Seller account required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      price,
      compareAtPrice,
      stock = 10,
      tags,
      craftDetails,
      careInstructions,
      imageUrl,
      variants,
    } = body;

    if (!title || !description || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Title, description, category, and price are required" },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const product = await prisma.product.create({
      data: {
        storeId: user.storeId,
        categoryId,
        title: title.trim(),
        slug,
        description: description.trim(),
        price: Math.round(Number(price) * 100), // convert dollars to cents
        compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
        stock: Number(stock),
        tags,
        craftDetails,
        careInstructions,
        status: "ACTIVE",
        images: {
          create: [
            {
              url: imageUrl || "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
              altText: title,
              isPrimary: true,
              order: 0,
            },
          ],
        },
        variants: variants?.length
          ? {
              create: variants.map((v: { name: string; option: string; priceDelta?: number; stock?: number }) => ({
                name: v.name,
                option: v.option,
                priceDelta: v.priceDelta ? Math.round(Number(v.priceDelta) * 100) : 0,
                stock: Number(v.stock || 5),
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
