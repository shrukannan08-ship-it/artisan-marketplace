export type UserRole = "CUSTOMER" | "SELLER" | "ADMIN";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string | null;
  storeSlug?: string | null;
  storeName?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  iconName?: string | null;
  featured?: boolean;
}

export interface Store {
  id: string;
  userId: string;
  slug: string;
  storeName: string;
  tagline?: string | null;
  description?: string | null;
  story?: string | null;
  craftsmanship?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  location?: string | null;
  rating: number;
  reviewCount: number;
  policyShipping?: string | null;
  policyReturns?: string | null;
  instagram?: string | null;
  featured?: boolean;
  createdAt?: string | Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  option: string;
  priceDelta: number;
  stock: number;
  sku?: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number; // in cents
  compareAtPrice?: number | null;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  sku?: string | null;
  status: string;
  featured: boolean;
  tags?: string | null;
  craftDetails?: string | null;
  careInstructions?: string | null;
  estimatedDispatchDays: number;
  store?: Store;
  category?: Category;
  images: ProductImage[];
  variants?: ProductVariant[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  storeId: string;
  store?: Store;
  productId: string;
  variantId?: string | null;
  productTitle: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  fulfillmentStatus: string;
  trackingNumber?: string | null;
  shippingCourier?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentIntentId?: string | null;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string | Date;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  productId: string;
  rating: number;
  title?: string | null;
  content: string;
  verifiedPurchase: boolean;
  createdAt: string | Date;
}

export interface Enquiry {
  id: string;
  storeId: string;
  productId?: string | null;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  subject: string;
  message: string;
  status: "NEW" | "REPLIED" | "CLOSED";
  createdAt: string | Date;
}
