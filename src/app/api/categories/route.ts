import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapCategory } from "@/lib/supabase/mappers";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const [{ data: categories, error }, { data: activeProducts }] = await Promise.all([
        supabase.from("categories").select("*").order("name", { ascending: true }),
        supabase.from("products").select("category_id").eq("status", "ACTIVE"),
      ]);

      if (error) {
        console.error("Supabase categories GET error:", error);
        return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
      }

      const countsByCategory = new Map<string, number>();
      for (const row of activeProducts ?? []) {
        countsByCategory.set(row.category_id, (countsByCategory.get(row.category_id) ?? 0) + 1);
      }

      return NextResponse.json({
        categories: (categories ?? []).map((cat) =>
          mapCategory({
            ...cat,
            _count: { products: countsByCategory.get(cat.id) ?? 0 },
          })
        ),
      });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
