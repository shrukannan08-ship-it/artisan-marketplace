import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import {
  callSupabaseEdgeFunction,
  createAdminClient,
  createClient,
} from "@/lib/supabase/server";
import { type DbRow, mapOrder } from "@/lib/supabase/mappers";

interface CheckoutItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { items, customerInfo, paymentMethod = "TEST_CARD" } = body as {
      items: CheckoutItemInput[];
      customerInfo: {
        fullName: string;
        email: string;
        street: string;
        apartment?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
      };
      paymentMethod?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    if (
      !customerInfo?.fullName ||
      !customerInfo?.email ||
      !customerInfo?.street ||
      !customerInfo?.city ||
      !customerInfo?.postalCode
    ) {
      return NextResponse.json(
        { error: "Please complete all required shipping details" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Try Edge Function first for isolated server-side order orchestration
      const edgeRes = await callSupabaseEdgeFunction<{ success: boolean; order: DbRow }>(
        "create-order",
        {
          method: "POST",
          body: { items, customerInfo, paymentMethod },
          accessToken: session?.access_token,
        }
      );

      if (edgeRes.ok && edgeRes.data?.order) {
        return NextResponse.json(
          { success: true, order: edgeRes.data.order },
          { status: 201 }
        );
      }

      // If Edge Function rejected due to business validation (400), forward that exact message
      if (edgeRes.status === 400 && edgeRes.error) {
        return NextResponse.json({ error: edgeRes.error }, { status: 400 });
      }

      // Otherwise call transactional PostgreSQL RPC directly (e.g., before Edge Functions are deployed)
      const rpcClient = isSupabaseAdminConfigured() ? createAdminClient() : supabase;
      const { data: orderData, error: rpcError } = await rpcClient.rpc("create_order", {
        p_items: items,
        p_customer_info: customerInfo,
        p_payment_method: paymentMethod,
        p_user_id: user?.id ?? null,
      });

      if (rpcError || !orderData) {
        return NextResponse.json(
          { error: rpcError?.message || "Failed to place order" },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, order: orderData }, { status: 201 });
    }

    let subtotalAmount = 0;
    const verifiedItems: {
      productId: string;
      storeId: string;
      variantId: string | null;
      productTitle: string;
      variantName: string | null;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }[] = [];

    for (const item of items) {
      if (item.quantity < 1) {
        return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product no longer exists (${item.productId})` },
          { status: 400 }
        );
      }

      if (product.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `"${product.title}" is no longer available for purchase` },
          { status: 400 }
        );
      }

      let unitPrice = product.price;
      let variantName: string | null = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Selected variant for "${product.title}" was not found` },
            { status: 400 }
          );
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Only ${variant.stock} left for ${product.title} (${variant.option})` },
            { status: 400 }
          );
        }
        unitPrice += variant.priceDelta;
        variantName = `${variant.name}: ${variant.option}`;
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Only ${product.stock} left for "${product.title}"` },
            { status: 400 }
          );
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotalAmount += totalPrice;

      verifiedItems.push({
        productId: product.id,
        storeId: product.storeId,
        variantId: item.variantId || null,
        productTitle: product.title,
        variantName,
        unitPrice,
        quantity: item.quantity,
        totalPrice,
      });
    }

    const shippingAmount = subtotalAmount >= 5000 ? 0 : 500;
    const taxAmount = Math.round(subtotalAmount * 0.08);
    const totalAmount = subtotalAmount + shippingAmount + taxAmount;

    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          guestEmail: user ? null : customerInfo.email,
          guestName: user ? null : customerInfo.fullName,
          subtotalAmount,
          shippingAmount,
          taxAmount,
          totalAmount,
          currency: "USD",
          status: "PAID",
          paymentStatus: "PAID",
          paymentMethod,
          shippingAddress: JSON.stringify(customerInfo),
          items: {
            create: verifiedItems.map((vi) => ({
              storeId: vi.storeId,
              productId: vi.productId,
              variantId: vi.variantId,
              productTitle: vi.productTitle,
              variantName: vi.variantName,
              unitPrice: vi.unitPrice,
              quantity: vi.quantity,
              totalPrice: vi.totalPrice,
              fulfillmentStatus: "PENDING",
            })),
          },
        },
        include: { items: true },
      });

      for (const vi of verifiedItems) {
        if (vi.variantId) {
          await tx.productVariant.update({
            where: { id: vi.variantId },
            data: { stock: { decrement: vi.quantity } },
          });
        }
        await tx.product.update({
          where: { id: vi.productId },
          data: { stock: { decrement: vi.quantity } },
        });
      }

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          subtotalAmount: order.subtotalAmount,
          shippingAmount: order.shippingAmount,
          taxAmount: order.taxAmount,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to process order. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: rows, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            stores (store_name, slug),
            products (
              id,
              slug,
              title,
              product_images (*)
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
      }

      return NextResponse.json({ orders: (rows ?? []).map(mapOrder) });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            store: { select: { storeName: true, slug: true } },
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

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
