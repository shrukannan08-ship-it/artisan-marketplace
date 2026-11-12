import React from "react";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/marketplace-queries";
import StorefrontView from "./StorefrontView";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) return { title: "Store Not Found" };

  return {
    title: `${store.storeName} | Artisan Storefront on Mitti & Muse`,
    description: store.description || store.tagline || "Artisan handmade products.",
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  // Format products so they include store info for the ProductCards
  const productsWithStore = (store.products ?? []).map((p) => ({
    ...p,
    store,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <StorefrontView store={store} products={productsWithStore} />
    </div>
  );
}
