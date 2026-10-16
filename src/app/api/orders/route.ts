import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

interface OrderItemRequest {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

interface CreateOrderRequestBody {
  items: OrderItemRequest[];
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
}

export async function POST(req: Request) {
  try {
    const body: CreateOrderRequestBody = await req.json();
    const { items, customerInfo, paymentMethod = "TEST_CARD" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Your basket is empty" },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.street || !customerInfo.city || !customerInfo.postalCode) {
      return NextResponse.json(
        { error: "Shipping address information is incomplete" },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    // 1. Fetch products & variants from database to verify prices and stock
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: true,
        store: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate existence and stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (product.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `"${product.title}" is currently unavailable` },
          { status: 400 }
        );
      }

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Variant not found for "${product.title}"` },
            { status: 400 }
          );
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for "${product.title}" (${variant.name}: ${variant.option}). Available: ${variant.stock}`,
            },
            { status: 400 }
          );
        }
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for "${product.title}". Available: ${product.stock}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. Server-side authoritative price calculation (NEVER trust frontend prices)
    let calculatedSubtotal = 0;
    const validatedOrderItems: {
      storeId: string;
      productId: string;
      variantId?: string | null;
      productTitle: string;
      variantName?: string | null;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      let unitPrice = product.price;
      let variantName: string | null = null;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId)!;
        unitPrice += variant.priceDelta;
        variantName = `${variant.name}: ${variant.option}`;
      }

      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedOrderItems.push({
        storeId: product.storeId,
        productId: product.id,
        variantId: item.variantId || null,
        productTitle: product.title,
        variantName,
        unitPrice,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    // Shipping and Tax rules
    // Free shipping on orders over $50.00 (5000 cents), otherwise $5.00 (500 cents)
    const shippingAmount = calculatedSubtotal >= 5000 ? 0 : 500;
    const taxAmount = Math.round(calculatedSubtotal * 0.08); // 8% estimated sales tax
    const totalAmount = calculatedSubtotal + shippingAmount + taxAmount;
    const orderNumber = generateOrderNumber();

    // 3. Execute atomic transaction: decrement stock & create order
    const resultOrder = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser?.id || null,
          guestEmail: currentUser ? null : customerInfo.email,
          guestName: currentUser ? null : customerInfo.fullName,
          subtotalAmount: calculatedSubtotal,
          shippingAmount,
          taxAmount,
          totalAmount,
          currency: "USD",
          status: "PAID",
          paymentStatus: "PAID",
          paymentMethod,
          paymentIntentId: `pi_test_${Date.now()}`,
          shippingAddress: JSON.stringify(customerInfo),
          items: {
            create: validatedOrderItems.map((item) => ({
              storeId: item.storeId,
              productId: item.productId,
              variantId: item.variantId,
              productTitle: item.productTitle,
              variantName: item.variantName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              fulfillmentStatus: "PENDING",
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: resultOrder.id,
        orderNumber: resultOrder.orderNumber,
        totalAmount: resultOrder.totalAmount,
        subtotalAmount: resultOrder.subtotalAmount,
        shippingAmount: resultOrder.shippingAmount,
        taxAmount: resultOrder.taxAmount,
        status: resultOrder.status,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            store: {
              select: {
                storeName: true,
                slug: true,
              },
            },
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
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
