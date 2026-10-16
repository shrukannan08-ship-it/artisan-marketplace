import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    if (!user || user.role !== "SELLER" || !user.storeId) {
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
