import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing Mitti & Muse Clean Database Schema & Categories...");

  // Remove any previous data to guarantee zero fake/hardcoded products, stores, reviews, or orders
  await prisma.review.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.collectionItem.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  // Initialize only the foundational Craft Categories (no fake products, no fake sellers)
  const categories = [
    {
      name: "Ceramics & Pottery",
      slug: "ceramics-pottery",
      description: "Hand-thrown stoneware, tactile mugs, vases, and ceramic tableware",
      imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
      iconName: "Coffee",
      featured: true,
    },
    {
      name: "Handmade Jewelry",
      slug: "handmade-jewelry",
      description: "Artisan necklaces, baroque pearl drops, rings, and fine gold vermeil",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
      iconName: "Sparkles",
      featured: true,
    },
    {
      name: "Candles & Scents",
      slug: "candles-scents",
      description: "Hand-poured coconut wax candles, botanical diffusers, and incense",
      imageUrl: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=400&q=80",
      iconName: "Flame",
      featured: true,
    },
    {
      name: "DIY & Craft Kits",
      slug: "diy-craft-kits",
      description: "Embroidery starter kits, candle pouring sets, and beginner weaving",
      imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80",
      iconName: "Palette",
      featured: true,
    },
    {
      name: "Textiles & Living",
      slug: "textiles-living",
      description: "Hand-loomed organic throws, botanical prints, and linen decor",
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80",
      iconName: "Layers",
      featured: true,
    },
    {
      name: "Paper & Stationery",
      slug: "paper-stationery",
      description: "Botanical journals, handmade cotton paper packs, and prints",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
      iconName: "BookOpen",
      featured: true,
    },
    {
      name: "Gifts & Bundles",
      slug: "gifts-bundles",
      description: "Curated gift sets, personalized tokens, and handmade hampers",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
      iconName: "Gift",
      featured: true,
    },
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  console.log("✅ Seed completed cleanly: Only standard craft categories initialized.");
  console.log("   - 0 Preloaded Products (Marketplace starts in clean state)");
  console.log("   - 0 Fake Sellers (Artisans create their own real storefronts)");
  console.log("   - 0 Fake Reviews or Sales Data");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
