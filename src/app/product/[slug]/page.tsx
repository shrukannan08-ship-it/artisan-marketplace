import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/marketplace-queries";
import ProductDetailView from "./ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} | ${product.store?.storeName || "Mitti & Muse"} on Mitti & Muse`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const { product, relatedProducts } = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
