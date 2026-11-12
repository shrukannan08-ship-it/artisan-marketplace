import type {
  Category,
  Enquiry,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductVariant,
  Review,
  Store,
} from "@/types";

export type DbRow = Record<string, unknown>;

function asStr(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val : val == null ? fallback : String(val);
}

function asOptStr(val: unknown): string | null {
  return typeof val === "string" ? val : null;
}

function asNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(val: unknown): boolean {
  return Boolean(val);
}

function asRow(val: unknown): DbRow | null {
  return val && typeof val === "object" && !Array.isArray(val) ? (val as DbRow) : null;
}

function asRowList(val: unknown): DbRow[] {
  return Array.isArray(val) ? val.filter((item): item is DbRow => Boolean(asRow(item))) : [];
}

export function mapCategory(row: DbRow): Category {
  return {
    id: asStr(row.id),
    name: asStr(row.name),
    slug: asStr(row.slug),
    description: asOptStr(row.description),
    imageUrl: asOptStr(row.image_url),
    iconName: asOptStr(row.icon_name),
    featured: asBool(row.featured),
    _count: row._count as { products: number } | undefined,
  };
}

export function mapStore(row: DbRow): Store {
  return {
    id: asStr(row.id),
    userId: asStr(row.user_id),
    slug: asStr(row.slug),
    storeName: asStr(row.store_name),
    tagline: asOptStr(row.tagline),
    description: asOptStr(row.description),
    story: asOptStr(row.story),
    craftsmanship: asOptStr(row.craftsmanship),
    logoUrl: asOptStr(row.logo_url),
    bannerUrl: asOptStr(row.banner_url),
    primaryColor: asStr(row.primary_color, "#C86D51"),
    accentColor: asStr(row.accent_color, "#5E8773"),
    location: asOptStr(row.location),
    rating: asNum(row.rating, 5.0),
    reviewCount: asNum(row.review_count, 0),
    policyShipping: asOptStr(row.policy_shipping),
    policyReturns: asOptStr(row.policy_returns),
    instagram: asOptStr(row.instagram),
    featured: asBool(row.featured),
    _count: row._count as { products: number } | undefined,
  };
}

export function mapProductImage(row: DbRow): ProductImage {
  return {
    id: asStr(row.id),
    url: asStr(row.url),
    altText: asOptStr(row.alt_text),
    isPrimary: asBool(row.is_primary),
    displayOrder: asNum(row.display_order, 0),
  };
}

export function mapProductVariant(row: DbRow): ProductVariant {
  return {
    id: asStr(row.id),
    name: asStr(row.name),
    option: asStr(row.option),
    priceDelta: asNum(row.price_delta, 0),
    stock: asNum(row.stock, 0),
    sku: asOptStr(row.sku),
  };
}

export function mapReview(row: DbRow): Review {
  return {
    id: asStr(row.id),
    userId: asStr(row.user_id),
    productId: asStr(row.product_id),
    userName: asOptStr(row.user_name),
    userAvatar: asOptStr(row.user_avatar),
    rating: asNum(row.rating, 5),
    title: asOptStr(row.title),
    content: asStr(row.content),
    verifiedPurchase: asBool(row.verified_purchase),
    createdAt: asStr(row.created_at),
  };
}

export function mapProduct(row: DbRow): Product {
  const rawImages = asRowList(row.product_images ?? row.images);
  const images = [...rawImages]
    .sort((a, b) => asNum(a.display_order, 0) - asNum(b.display_order, 0))
    .map(mapProductImage);

  const variants = asRowList(row.product_variants ?? row.variants).map(mapProductVariant);

  const reviews = Array.isArray(row.reviews)
    ? [...asRowList(row.reviews)]
        .sort(
          (a, b) =>
            new Date(asStr(b.created_at)).getTime() - new Date(asStr(a.created_at)).getTime()
        )
        .map(mapReview)
    : undefined;

  const storeRow = asRow(row.stores ?? row.store);
  const categoryRow = asRow(row.categories ?? row.category);

  return {
    id: asStr(row.id),
    storeId: asStr(row.store_id),
    categoryId: asStr(row.category_id),
    title: asStr(row.title),
    slug: asStr(row.slug),
    description: asStr(row.description),
    price: asNum(row.price),
    compareAtPrice: row.compare_at_price == null ? null : asNum(row.compare_at_price),
    currency: asStr(row.currency, "USD"),
    stock: asNum(row.stock, 0),
    lowStockThreshold: asNum(row.low_stock_threshold, 3),
    sku: asOptStr(row.sku),
    status: (asStr(row.status, "ACTIVE") as Product["status"]),
    featured: asBool(row.featured),
    tags: asOptStr(row.tags),
    craftDetails: asOptStr(row.craft_details),
    careInstructions: asOptStr(row.care_instructions),
    estimatedDispatchDays: asNum(row.estimated_dispatch_days, 2),
    createdAt: asStr(row.created_at),
    store: storeRow ? mapStore(storeRow) : undefined,
    category: categoryRow ? mapCategory(categoryRow) : undefined,
    images,
    variants,
    reviews,
    _count: row._count as { orderItems: number; reviews: number } | undefined,
  };
}

export function mapOrderItem(row: DbRow): OrderItem {
  const storeRow = asRow(row.stores ?? row.store);
  const productRow = asRow(row.products ?? row.product);
  return {
    id: asStr(row.id),
    orderId: asStr(row.order_id),
    storeId: asStr(row.store_id),
    productId: asStr(row.product_id),
    variantId: asOptStr(row.variant_id),
    productTitle: asStr(row.product_title),
    variantName: asOptStr(row.variant_name),
    unitPrice: asNum(row.unit_price),
    quantity: asNum(row.quantity, 1),
    totalPrice: asNum(row.total_price),
    fulfillmentStatus: asStr(row.fulfillment_status, "PENDING") as OrderItem["fulfillmentStatus"],
    trackingNumber: asOptStr(row.tracking_number),
    shippingCourier: asOptStr(row.shipping_courier),
    store: storeRow ? mapStore(storeRow) : undefined,
    product: productRow ? mapProduct(productRow) : undefined,
  };
}

export function mapOrder(row: DbRow): Order {
  const rawItems = asRowList(row.order_items ?? row.items);
  return {
    id: asStr(row.id),
    orderNumber: asStr(row.order_number),
    userId: asOptStr(row.user_id),
    guestEmail: asOptStr(row.guest_email),
    guestName: asOptStr(row.guest_name),
    subtotalAmount: asNum(row.subtotal_amount),
    shippingAmount: asNum(row.shipping_amount, 0),
    taxAmount: asNum(row.tax_amount, 0),
    totalAmount: asNum(row.total_amount),
    currency: asStr(row.currency, "USD"),
    status: asStr(row.status, "PENDING") as Order["status"],
    paymentStatus: asStr(row.payment_status, "PENDING"),
    paymentMethod: asStr(row.payment_method, "TEST_CARD"),
    shippingAddress: asStr(row.shipping_address),
    createdAt: asStr(row.created_at),
    items: rawItems.map(mapOrderItem),
  };
}

export function mapEnquiry(row: DbRow): Enquiry {
  const productRow = asRow(row.products ?? row.product);
  return {
    id: asStr(row.id),
    storeId: asStr(row.store_id),
    productId: asOptStr(row.product_id),
    senderName: asStr(row.sender_name),
    senderEmail: asStr(row.sender_email),
    senderPhone: asOptStr(row.sender_phone),
    subject: asStr(row.subject),
    message: asStr(row.message),
    status: asStr(row.status, "NEW") as Enquiry["status"],
    createdAt: asStr(row.created_at),
    product: productRow
      ? { id: asStr(productRow.id), title: asStr(productRow.title), slug: asStr(productRow.slug) }
      : null,
  };
}
