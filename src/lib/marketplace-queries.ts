import prisma from "@/lib/prisma";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient, createClient, createPublicClient } from "@/lib/supabase/server";
import {
  type DbRow,
  mapCategory,
  mapOrder,
  mapProduct,
  mapReview,
  mapStore,
} from "@/lib/supabase/mappers";

export async function getHomePageData() {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const [categoriesRes, productsRes, storesRes, reviewsRes] = await Promise.all([
      supabase.from("categories").select("*").eq("featured", true).limit(8),
      supabase
        .from("products")
        .select(`*, categories (*), stores (*), product_images (*), product_variants (*)`)
        .eq("status", "ACTIVE")
        .eq("featured", true)
        .limit(8),
      supabase
        .from("stores")
        .select(`*, products (*, product_images (*))`)
        .eq("featured", true)
        .limit(4),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(3),
    ]);

    return {
      categories: (categoriesRes.data ?? []).map(mapCategory),
      featuredProducts: (productsRes.data ?? []).map(mapProduct),
      featuredStores: (storesRes.data ?? []).map((row: DbRow) => ({
        ...mapStore(row),
        products: (Array.isArray(row.products) ? (row.products as DbRow[]) : [])
          .filter((p) => p.status === "ACTIVE")
          .slice(0, 3)
          .map(mapProduct),
      })),
      reviews: (reviewsRes.data ?? []).map(mapReview),
    };
  }

  const [categories, featuredProducts, featuredStores, reviews] = await Promise.all([
    prisma.category.findMany({ where: { featured: true }, take: 8 }),
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      take: 8,
      include: {
        category: true,
        store: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.store.findMany({
      where: { featured: true },
      take: 4,
      include: {
        products: {
          take: 3,
          include: { images: true },
        },
      },
    }),
    prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { categories, featuredProducts, featuredStores, reviews };
}

export async function getMarketplaceData(params: {
  q?: string;
  category?: string;
  store?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const { q = "", category = "", store = "", sort = "featured", minPrice, maxPrice } = params;

  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();

    const [categoriesRes, storesRes] = await Promise.all([
      supabase.from("categories").select("*").order("name", { ascending: true }),
      supabase.from("stores").select("*").order("store_name", { ascending: true }),
    ]);

    const categoryMatch = category
      ? (categoriesRes.data ?? []).find((c) => c.slug === category)
      : null;
    const storeMatch = store
      ? (storesRes.data ?? []).find((s) => s.slug === store)
      : null;

    let products: ReturnType<typeof mapProduct>[] = [];
    if ((!category || categoryMatch) && (!store || storeMatch)) {
      let query = supabase
        .from("products")
        .select(`*, categories (*), stores (*), product_images (*), product_variants (*)`)
        .eq("status", "ACTIVE");

      if (q) {
        const escaped = q.replace(/[%_,]/g, "");
        query = query.or(
          `title.ilike.%${escaped}%,description.ilike.%${escaped}%,tags.ilike.%${escaped}%`
        );
      }
      if (categoryMatch) query = query.eq("category_id", categoryMatch.id);
      if (storeMatch) query = query.eq("store_id", storeMatch.id);
      if (minPrice) query = query.gte("price", parseInt(minPrice, 10) * 100);
      if (maxPrice) query = query.lte("price", parseInt(maxPrice, 10) * 100);

      if (sort === "price-low" || sort === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price-high" || sort === "price_desc") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: prodRows } = await query;
      products = (prodRows ?? []).map(mapProduct);
    }

    return {
      products,
      categories: (categoriesRes.data ?? []).map(mapCategory),
      stores: (storesRes.data ?? []).map(mapStore),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "ACTIVE" };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ];
  }
  if (category) where.category = { slug: category };
  if (store) where.store = { slug: store };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice, 10) * 100;
    if (maxPrice) where.price.lte = parseInt(maxPrice, 10) * 100;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-low") orderBy = { price: "asc" };
  else if (sort === "price-high") orderBy = { price: "desc" };

  const [products, categories, stores] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        store: true,
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.store.findMany({ orderBy: { storeName: "asc" } }),
  ]);

  return { products, categories, stores };
}

export async function getProductBySlug(slug: string) {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data: row } = await supabase
      .from("products")
      .select(`*, categories (*), stores (*), product_images (*), product_variants (*)`)
      .eq("slug", slug)
      .maybeSingle();

    if (!row) return { product: null, relatedProducts: [] };

    const product = mapProduct(row);
    const { data: relatedRows } = await supabase
      .from("products")
      .select(`*, categories (*), stores (*), product_images (*)`)
      .neq("id", product.id)
      .eq("status", "ACTIVE")
      .or(`store_id.eq.${product.storeId},category_id.eq.${product.categoryId}`)
      .limit(4);

    return {
      product,
      relatedProducts: (relatedRows ?? []).map(mapProduct),
    };
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      store: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) return { product: null, relatedProducts: [] };

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "ACTIVE",
      OR: [{ storeId: product.storeId }, { categoryId: product.categoryId }],
    },
    take: 4,
    include: {
      images: { orderBy: { order: "asc" } },
      store: true,
    },
  });

  return { product, relatedProducts };
}

export async function getStoreBySlug(slug: string) {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data: row } = await supabase
      .from("stores")
      .select(`
        *,
        products (
          *,
          categories (*),
          product_images (*),
          product_variants (*)
        )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (!row) return null;

    const activeProducts = (Array.isArray(row.products) ? (row.products as DbRow[]) : [])
      .filter((p) => p.status === "ACTIVE")
      .sort(
        (a, b) =>
          new Date(String(b.created_at ?? "")).getTime() -
          new Date(String(a.created_at ?? "")).getTime()
      )
      .map(mapProduct);

    return {
      ...mapStore(row),
      products: activeProducts,
    };
  }

  return prisma.store.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          category: true,
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAllStoresWithProducts(limitProducts = 3) {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data: rows } = await supabase
      .from("stores")
      .select(`
        *,
        products (
          *,
          product_images (*)
        )
      `)
      .order("rating", { ascending: false });

    return (rows ?? []).map((row: DbRow) => ({
      ...mapStore(row),
      products: (Array.isArray(row.products) ? (row.products as DbRow[]) : [])
        .filter((p) => p.status === "ACTIVE")
        .slice(0, limitProducts)
        .map(mapProduct),
    }));
  }

  return prisma.store.findMany({
    include: {
      products: {
        where: { status: "ACTIVE" },
        take: limitProducts,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
    orderBy: { rating: "desc" },
  });
}

export async function getUserOrders(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          stores (*),
          products (
            *,
            product_images (*)
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return (rows ?? []).map(mapOrder);
  }

  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          store: true,
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderConfirmation(orderId: string, receiptToken?: string | null) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: rpcOrder } = await supabase.rpc("get_order_receipt", {
      p_order_id: orderId,
      p_receipt_token: receiptToken || null,
    });

    if (rpcOrder) {
      return rpcOrder;
    }

    if (isSupabaseAdminConfigured() && receiptToken) {
      const admin = createAdminClient();
      const { data: row } = await admin
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            stores (*),
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq("id", orderId)
        .eq("receipt_token", receiptToken)
        .maybeSingle();

      return row ? mapOrder(row) : null;
    }

    return null;
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          store: true,
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  });
}
