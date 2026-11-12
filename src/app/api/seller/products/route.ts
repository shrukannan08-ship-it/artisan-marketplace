import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: rows, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (*),
          product_images (*),
          product_variants (*)
        `)
        .eq("store_id", user.storeId)
        .neq("status", "ARCHIVED")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
      }

      return NextResponse.json({ products: (rows ?? []).map(mapProduct) });
    }

    const products = await prisma.product.findMany({
      where: { storeId: user.storeId, status: { not: "ARCHIVED" } },
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
