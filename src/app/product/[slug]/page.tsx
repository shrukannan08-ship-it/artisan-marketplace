import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailView from "./ProductDetailView";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { store: true },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} | ${product.store.storeName} on Mitti & Muse`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      store: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products from same store or category
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "ACTIVE",
      OR: [
        { storeId: product.storeId },
        { categoryId: product.categoryId },
      ],
    },
    take: 4,
    include: {
      images: { orderBy: { order: "asc" } },
      store: true,
      category: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
