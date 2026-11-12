import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, mapStore } from "@/lib/supabase/mappers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const [{ data: store, error }, { data: products }] = await Promise.all([
        supabase.from("stores").select("*").eq("id", user.storeId).single(),
        supabase
          .from("products")
          .select(`*, product_images (*)`)
          .eq("store_id", user.storeId)
          .limit(6),
      ]);

      if (error || !store) {
        return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
      }

      return NextResponse.json({
        store: {
          ...mapStore(store),
          products: (products ?? []).map(mapProduct),
        },
      });
    }

    const store = await prisma.store.findUnique({
      where: { id: user.storeId },
      include: {
        products: {
          take: 6,
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("GET /api/seller/storefront error:", error);
    return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      storeName,
      tagline,
      description,
      story,
      craftsmanship,
      logoUrl,
      bannerUrl,
      primaryColor,
      accentColor,
      location,
      policyShipping,
      policyReturns,
      instagram,
    } = body;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const updateRow: Record<string, unknown> = {};
      if (storeName) updateRow.store_name = String(storeName).trim();
      if (tagline !== undefined) updateRow.tagline = tagline;
      if (description !== undefined) updateRow.description = description;
      if (story !== undefined) updateRow.story = story;
      if (craftsmanship !== undefined) updateRow.craftsmanship = craftsmanship;
      if (logoUrl !== undefined) updateRow.logo_url = logoUrl;
      if (bannerUrl !== undefined) updateRow.banner_url = bannerUrl;
      if (primaryColor !== undefined) updateRow.primary_color = primaryColor;
      if (accentColor !== undefined) updateRow.accent_color = accentColor;
      if (location !== undefined) updateRow.location = location;
      if (policyShipping !== undefined) updateRow.policy_shipping = policyShipping;
      if (policyReturns !== undefined) updateRow.policy_returns = policyReturns;
      if (instagram !== undefined) updateRow.instagram = instagram;

      const { data: updated, error } = await supabase
        .from("stores")
        .update(updateRow)
        .eq("id", user.storeId)
        .select("*")
        .single();

      if (error || !updated) {
        return NextResponse.json({ error: error?.message || "Failed to update storefront" }, { status: 500 });
      }

      return NextResponse.json({ success: true, store: mapStore(updated) });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (storeName) {
      updateData.storeName = storeName.trim();
    }
    if (tagline !== undefined) updateData.tagline = tagline;
    if (description !== undefined) updateData.description = description;
    if (story !== undefined) updateData.story = story;
    if (craftsmanship !== undefined) updateData.craftsmanship = craftsmanship;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (location !== undefined) updateData.location = location;
    if (policyShipping !== undefined) updateData.policyShipping = policyShipping;
    if (policyReturns !== undefined) updateData.policyReturns = policyReturns;
    if (instagram !== undefined) updateData.instagram = instagram;

    const updated = await prisma.store.update({
      where: { id: user.storeId },
      data: updateData,
    });

    return NextResponse.json({ success: true, store: updated });
  } catch (error) {
    console.error("PATCH /api/seller/storefront error:", error);
    return NextResponse.json({ error: "Failed to update storefront" }, { status: 500 });
  }
}
