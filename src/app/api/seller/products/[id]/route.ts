import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/supabase/mappers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: product, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (*),
          product_images (*),
          product_variants (*)
        `)
        .eq("id", id)
        .eq("store_id", user.storeId)
        .maybeSingle();

      if (error || !product) {
        return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
      }

      return NextResponse.json({ product: mapProduct(product) });
    }

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
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
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

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: existing } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("store_id", user.storeId)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
      }

      const updateFields: Record<string, unknown> = {};
      if (title) updateFields.title = String(title).trim();
      if (description !== undefined) updateFields.description = description;
      if (categoryId) updateFields.category_id = categoryId;
      if (price !== undefined) updateFields.price = Math.round(Number(price) * 100);
      if (compareAtPrice !== undefined) {
        updateFields.compare_at_price = compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : null;
      }
      if (stock !== undefined) updateFields.stock = Number(stock);
      if (status) updateFields.status = status;
      if (tags !== undefined) updateFields.tags = tags;
      if (craftDetails !== undefined) updateFields.craft_details = craftDetails;
      if (careInstructions !== undefined) updateFields.care_instructions = careInstructions;

      const { data: updated, error: updateErr } = await supabase
        .from("products")
        .update(updateFields)
        .eq("id", id)
        .eq("store_id", user.storeId)
        .select("*")
        .single();

      if (updateErr || !updated) {
        return NextResponse.json({ error: updateErr?.message || "Failed to update product" }, { status: 500 });
      }

      if (imageUrl) {
        await supabase.from("product_images").delete().eq("product_id", id);
        await supabase.from("product_images").insert({
          product_id: id,
          url: imageUrl,
          alt_text: updated.title,
          is_primary: true,
          display_order: 0,
        });
      }

      const { data: hydrated } = await supabase
        .from("products")
        .select(`
          *,
          categories (*),
          product_images (*),
          product_variants (*)
        `)
        .eq("id", id)
        .single();

      return NextResponse.json({
        success: true,
        product: mapProduct(hydrated ?? updated),
      });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.storeId !== user.storeId) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        description: description !== undefined ? description : existing.description,
        categoryId: categoryId || existing.categoryId,
        price: price !== undefined ? Math.round(Number(price) * 100) : existing.price,
        compareAtPrice:
          compareAtPrice !== undefined
            ? compareAtPrice
              ? Math.round(Number(compareAtPrice) * 100)
              : null
            : existing.compareAtPrice,
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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isOwner(user) || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: existing } = await supabase
        .from("products")
        .select("id, store_id")
        .eq("id", id)
        .eq("store_id", user.storeId)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("store_id", user.storeId);

      if (error) {
        // Archive instead of failing with 500 when historical order_items reference this product
        if (error.code === "23503") {
          const { error: archiveErr } = await supabase
            .from("products")
            .update({ status: "ARCHIVED" })
            .eq("id", id)
            .eq("store_id", user.storeId);
          if (!archiveErr) {
            return NextResponse.json({
              success: true,
              archived: true,
              message: "Product archived to preserve existing order history",
            });
          }
        }
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Product deleted" });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.storeId !== user.storeId) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
    }

    const referencedOrderItems = await prisma.orderItem.count({ where: { productId: id } });
    if (referencedOrderItems > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      return NextResponse.json({
        success: true,
        archived: true,
        message: "Product archived to preserve existing order history",
      });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/seller/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
