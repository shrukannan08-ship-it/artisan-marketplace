import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category")?.trim() || "";
    const storeSlug = searchParams.get("store")?.trim() || "";
    const sort = searchParams.get("sort") || "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const featured = searchParams.get("featured") === "true";

    if (isSupabaseConfigured()) {
      const supabase = await createClient();

      let categoryIdFilter: string | null = null;
      if (categorySlug && categorySlug !== "all") {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .maybeSingle();
        if (!cat) {
          return NextResponse.json({ products: [] });
        }
        categoryIdFilter = cat.id;
      }

      let storeIdFilter: string | null = null;
      if (storeSlug) {
        const { data: store } = await supabase
          .from("stores")
          .select("id")
          .eq("slug", storeSlug)
          .maybeSingle();
        if (!store) {
          return NextResponse.json({ products: [] });
        }
        storeIdFilter = store.id;
      }

      let query = supabase
        .from("products")
        .select(`
          *,
          stores (*),
          categories (*),
          product_images (*),
          product_variants (*)
        `)
        .eq("status", "ACTIVE");

      if (q) {
        const escaped = q.replace(/[%_,]/g, "");
        query = query.or(
          `title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.ilike.%${escaped}%`
        );
      }
      if (categoryIdFilter) query = query.eq("category_id", categoryIdFilter);
      if (storeIdFilter) query = query.eq("store_id", storeIdFilter);
      if (featured) query = query.eq("featured", true);
      if (minPrice) query = query.gte("price", Math.round(Number(minPrice) * 100));
      if (maxPrice) query = query.lte("price", Math.round(Number(maxPrice) * 100));

      if (sort === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price_desc") {
        query = query.order("price", { ascending: false });
      } else if (sort === "featured") {
        query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: rows, error } = await query;
      if (error) {
        console.error("Supabase products GET error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
      }

      return NextResponse.json({ products: (rows ?? []).map(mapProduct) });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { status: "ACTIVE" };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }
    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }
    if (storeSlug) {
      where.store = { slug: storeSlug };
    }
    if (featured) {
      where.featured = true;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Math.round(Number(minPrice) * 100);
      if (maxPrice) where.price.lte = Math.round(Number(maxPrice) * 100);
    }

    let orderBy: Record<string, string> | Record<string, string>[] = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "featured") orderBy = [{ featured: "desc" }, { createdAt: "desc" }];

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        store: true,
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isOwner(user) || !user?.storeId) {
      return NextResponse.json(
        { error: "Unauthorized. Business owner access required." },
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
      stock,
      status = "ACTIVE",
      tags,
      craftDetails,
      careInstructions,
      estimatedDispatchDays = 2,
      images = [],
      variants = [],
    } = body;

    if (!title || !description || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Title, description, category, and price are required" },
        { status: 400 }
      );
    }

    const parsedPriceCents = Math.round(Number(price) * 100);
    if (Number.isNaN(parsedPriceCents) || parsedPriceCents < 0) {
      return NextResponse.json({ error: "Invalid price amount" }, { status: 400 });
    }

    const baseSlug = slugify(title);

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: existingSlug } = await supabase
        .from("products")
        .select("id")
        .eq("slug", baseSlug)
        .maybeSingle();

      const finalSlug = existingSlug
        ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
        : baseSlug;

      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert({
          store_id: user.storeId,
          category_id: categoryId,
          title: String(title).trim(),
          slug: finalSlug,
          description: String(description).trim(),
          price: parsedPriceCents,
          compare_at_price: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
          stock: Number(stock ?? 10),
          status,
          tags: tags || null,
          craft_details: craftDetails || null,
          care_instructions: careInstructions || null,
          estimated_dispatch_days: Number(estimatedDispatchDays || 2),
        })
        .select("*")
        .single();

      if (insertError || !inserted) {
        console.error("Supabase product insert error:", insertError);
        return NextResponse.json({ error: insertError?.message || "Failed to create product" }, { status: 400 });
      }

      if (Array.isArray(images) && images.length > 0) {
        await supabase.from("product_images").insert(
          images.map((url: string, idx: number) => ({
            product_id: inserted.id,
            url,
            is_primary: idx === 0,
            display_order: idx,
          }))
        );
      }

      if (Array.isArray(variants) && variants.length > 0) {
        await supabase.from("product_variants").insert(
          variants.map((v: { name?: string; option?: string; priceDelta?: number; stock?: number }) => ({
            product_id: inserted.id,
            name: v.name || "Option",
            option: v.option || "Standard",
            price_delta: Math.round(Number(v.priceDelta || 0) * 100),
            stock: Number(v.stock ?? 5),
          }))
        );
      }

      const { data: hydrated } = await supabase
        .from("products")
        .select(`
          *,
          stores (*),
          categories (*),
          product_images (*),
          product_variants (*)
        `)
        .eq("id", inserted.id)
        .single();

      return NextResponse.json(
        { product: hydrated ? mapProduct(hydrated) : mapProduct(inserted) },
        { status: 201 }
      );
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug: baseSlug } });
    const finalSlug = existingSlug
      ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
      : baseSlug;

    const product = await prisma.product.create({
      data: {
        storeId: user.storeId,
        categoryId,
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        price: parsedPriceCents,
        compareAtPrice: compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null,
        stock: Number(stock ?? 10),
        status,
        tags: tags || null,
        craftDetails: craftDetails || null,
        careInstructions: careInstructions || null,
        estimatedDispatchDays: Number(estimatedDispatchDays || 2),
        images: {
          create: (images as string[]).map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
        variants: {
          create: (variants as { name?: string; option?: string; priceDelta?: number; stock?: number }[]).map((v) => ({
            name: v.name || "Option",
            option: v.option || "Standard",
            priceDelta: Math.round(Number(v.priceDelta || 0) * 100),
            stock: Number(v.stock ?? 5),
          })),
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
        store: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
