import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Mitti & Muse database seed...");

  // Clean existing data
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

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@mittimuse.com",
      name: "Admin Curator",
      passwordHash,
      role: "ADMIN",
    },
  });

  const seller1User = await prisma.user.create({
    data: {
      email: "meera@mitticeramics.com",
      name: "Meera Patel",
      passwordHash,
      role: "SELLER",
      phone: "+1 555-019-2831",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  });

  const seller2User = await prisma.user.create({
    data: {
      email: "aisha@aurajewels.com",
      name: "Aisha & Zoya Rao",
      passwordHash,
      role: "SELLER",
      phone: "+1 555-014-9820",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
  });

  const seller3User = await prisma.user.create({
    data: {
      email: "elena@botanicawick.com",
      name: "Elena Chen",
      passwordHash,
      role: "SELLER",
      phone: "+1 555-017-4932",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
  });

  const seller4User = await prisma.user.create({
    data: {
      email: "chloe@makerbloom.com",
      name: "Chloe & Liam Davies",
      passwordHash,
      role: "SELLER",
      phone: "+1 555-018-7241",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "priya@example.com",
      name: "Priya Sharma",
      passwordHash,
      role: "CUSTOMER",
      phone: "+1 555-012-3456",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 2. Create Stores
  const mittiStore = await prisma.store.create({
    data: {
      userId: seller1User.id,
      slug: "mitti-ceramics",
      storeName: "Mitti Ceramics",
      tagline: "Earthy stoneware shaped by hand, touched by warmth",
      description: "Slow, tactile pottery handcrafted in Jaipur. Non-toxic glazes, organic silhouettes, and functional objects designed to elevate your daily rituals.",
      story: "Founded by Meera Patel in a sunlit courtyard studio, Mitti Ceramics began as a personal ode to traditional river clay. Meera works with local clay recipes and wood-fired kilns, creating ceramics that celebrate subtle irregularities, wabi-sabi textures, and the grounding serenity of the earth.",
      craftsmanship: "Each piece is wheel-thrown or hand-pinched, bisque-fired at 900°C, hand-glazed with custom mineral pigments, and high-fired at 1220°C for lifetime durability.",
      logoUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#C86D51",
      accentColor: "#98C4B4",
      location: "Jaipur, India",
      rating: 4.95,
      reviewCount: 48,
      policyShipping: "Orders dispatch within 2-3 business days in plastic-free recycled honeycomb wrap. Express courier delivery available worldwide.",
      policyReturns: "We accept returns of unused pieces in original packaging within 14 days of delivery. Custom commissions are non-refundable.",
      instagram: "@mitti.ceramics",
      featured: true,
    },
  });

  const auraStore = await prisma.store.create({
    data: {
      userId: seller2User.id,
      slug: "aura-jewels",
      storeName: "Aura Botanical Jewels",
      tagline: "Heirloom jewelry spun with freshwater pearls and recycled gold",
      description: "Delicate, romantic fine jewelry inspired by wild blossoms, morning dew, and vintage poetry. Created for modern romantics.",
      story: "Sisters Aisha and Zoya grew up surrounded by their grandmother's antique jewelry box and flower press. Aura translates ephemeral natural wonders into timeless keepsakes, cast exclusively in 18k gold vermeil and ethically sourced gemstones.",
      craftsmanship: "Lost-wax micro casting, hand-set genuine gemstones, natural baroque freshwater pearls, and durable 2.5 micron 18k gold plating.",
      logoUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#DFB0A5",
      accentColor: "#5E8773",
      location: "San Francisco, CA",
      rating: 5.0,
      reviewCount: 72,
      policyShipping: "Complimentary signature gift box with every order. Dispatches in 1-2 business days with fully insured tracking.",
      policyReturns: "30-day happiness guarantee for all non-custom jewelry pieces.",
      instagram: "@aurajewels.co",
      featured: true,
    },
  });

  const botanicaStore = await prisma.store.create({
    data: {
      userId: seller3User.id,
      slug: "botanica-wick",
      storeName: "Botanica & Wick",
      tagline: "Clean coconut-soy candles infused with wild botanicals & wooden wicks",
      description: "Hand-poured olfactory landscapes that bring the quiet solace of forest groves, warm bakeries, and blooming gardens into your living room.",
      story: "Elena Chen started pouring candles in her apartment kitchen after discovering that commercial paraffin candles caused headaches. Today, Botanica & Wick formulates clean, therapeutic fragrances inspired by herbal folklore.",
      craftsmanship: "100% slow-burning coconut-soy wax, sustainably harvested crackling FSC-certified wood wicks, and phthalate-free clean botanical essences.",
      logoUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#5E8773",
      accentColor: "#E8B86D",
      location: "Portland, OR",
      rating: 4.88,
      reviewCount: 39,
      policyShipping: "Packed in biodegradable cornstarch peanuts and recycled kraft cartons. Ships within 48 hours.",
      policyReturns: "Unburned candles in pristine condition can be exchanged within 21 days.",
      instagram: "@botanica.and.wick",
      featured: true,
    },
  });

  const makerbloomStore = await prisma.store.create({
    data: {
      userId: seller4User.id,
      slug: "makerbloom-crafts",
      storeName: "MakerBloom Studio",
      tagline: "Inspiring DIY craft kits, botanical paper packs & creative happiness",
      description: "Everything you need to make something beautiful. Thoughtful kits, joyful yarns, and mindful supplies for beginners and seasoned creators alike.",
      story: "Chloe and Liam believe everyone is an artist at heart. MakerBloom was launched to make crafting accessible, joyful, and relaxing through all-inclusive DIY boxes paired with video workshops.",
      craftsmanship: "Ethically spun Peruvian wool, hand-drawn embroidery patterns printed on organic cotton, and hand-cut artisanal papers.",
      logoUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=300&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#C86D51",
      accentColor: "#B8B9E0",
      location: "Austin, TX",
      rating: 4.92,
      reviewCount: 84,
      policyShipping: "Flat $5 shipping nationwide. Free shipping on orders over $50.",
      policyReturns: "Unopened craft kits and bundles eligible for 30-day hassle-free returns.",
      instagram: "@makerbloom.crafts",
      featured: true,
    },
  });

  // 3. Create Categories
  const catCeramics = await prisma.category.create({
    data: {
      name: "Ceramics & Pottery",
      slug: "ceramics-pottery",
      description: "Hand-thrown stoneware, tactile mugs, vases, and ceramic tableware",
      imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80",
      iconName: "Coffee",
      featured: true,
    },
  });

  const catJewelry = await prisma.category.create({
    data: {
      name: "Handmade Jewelry",
      slug: "handmade-jewelry",
      description: "Artisan necklaces, baroque pearl drops, rings, and fine gold vermeil",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
      iconName: "Sparkles",
      featured: true,
    },
  });

  const catCandles = await prisma.category.create({
    data: {
      name: "Candles & Scents",
      slug: "candles-scents",
      description: "Hand-poured coconut wax candles, botanical diffusers, and incense",
      imageUrl: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=400&q=80",
      iconName: "Flame",
      featured: true,
    },
  });

  const catCraftKits = await prisma.category.create({
    data: {
      name: "DIY & Craft Kits",
      slug: "diy-craft-kits",
      description: "Embroidery starter kits, candle pouring sets, and beginner weaving",
      imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=400&q=80",
      iconName: "Palette",
      featured: true,
    },
  });

  const catTextiles = await prisma.category.create({
    data: {
      name: "Textiles & Living",
      slug: "textiles-living",
      description: "Hand-loomed organic throws, botanical prints, and linen decor",
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80",
      iconName: "Layers",
      featured: true,
    },
  });

  const catPaper = await prisma.category.create({
    data: {
      name: "Paper & Stationery",
      slug: "paper-stationery",
      description: "Botanical journals, handmade cotton paper packs, and prints",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
      iconName: "BookOpen",
      featured: true,
    },
  });

  const catGifts = await prisma.category.create({
    data: {
      name: "Gifts & Bundles",
      slug: "gifts-bundles",
      description: "Curated gift sets, personalized tokens, and handmade hampers",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
      iconName: "Gift",
      featured: true,
    },
  });

  // 4. Create Products with Variants and Images
  // Product 1: Speckled Stoneware Mug
  const prod1 = await prisma.product.create({
    data: {
      storeId: mittiStore.id,
      categoryId: catCeramics.id,
      title: "Hand-thrown Speckled Stoneware Mug",
      slug: "hand-thrown-speckled-stoneware-mug",
      description: "Our signature morning companion. Wheel-thrown using iron-rich stoneware, finished with a raw unglazed exterior base and a silky, satin cream glaze inside. Each mug retains subtle organic ridge lines from Meera's fingers on the potter's wheel.",
      price: 3400, // $34.00
      compareAtPrice: 4000,
      stock: 18,
      lowStockThreshold: 4,
      sku: "MITTI-MUG-001",
      status: "ACTIVE",
      featured: true,
      tags: "pottery,mug,ceramics,stoneware,kitchen",
      craftDetails: "Hand-thrown iron stoneware, food-safe feldspar glaze, fired to cone 6 (1220°C). Microwave and dishwasher safe.",
      careInstructions: "Dishwasher and microwave safe. For longevity, gentle handwashing with mild soap is recommended.",
      estimatedDispatchDays: 2,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
            altText: "Hand-thrown Speckled Stoneware Mug with morning coffee",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80",
            altText: "Ceramic mug detail and comfortable thumb rest",
            isPrimary: false,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Size",
            option: "Regular (10 oz)",
            priceDelta: 0,
            stock: 12,
            sku: "MITTI-MUG-REG",
          },
          {
            name: "Size",
            option: "Grande (14 oz)",
            priceDelta: 600,
            stock: 6,
            sku: "MITTI-MUG-GRD",
          },
        ],
      },
    },
  });

  // Product 2: Terracotta Wabi-Sabi Vase
  const prod2 = await prisma.product.create({
    data: {
      storeId: mittiStore.id,
      categoryId: catCeramics.id,
      title: "Wabi-Sabi Terracotta Ikebana Vessel",
      slug: "wabi-sabi-terracotta-ikebana-vessel",
      description: "An sculptural vessel inspired by Japanese floral philosophy. Hand-carved textured surface with a warm terracotta undertone and distressed ash wash.",
      price: 5800,
      compareAtPrice: 6500,
      stock: 7,
      lowStockThreshold: 2,
      sku: "MITTI-VASE-002",
      status: "ACTIVE",
      featured: true,
      tags: "vase,home-decor,terracotta,ikebana",
      craftDetails: "Coil-built and paddle-shaped local clay, naturally aged patina.",
      careInstructions: "Watertight. Wipe clean with soft damp cloth.",
      estimatedDispatchDays: 3,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
            altText: "Wabi-sabi terracotta vessel with dried eucalyptus",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    },
  });

  // Product 3: Sakura Whisper Pearl & Morganite Earrings (Reference 3 item)
  const prod3 = await prisma.product.create({
    data: {
      storeId: auraStore.id,
      categoryId: catJewelry.id,
      title: "Sakura Whisper Pearl & Morganite Earrings",
      slug: "sakura-whisper-pearl-morganite-earrings",
      description: "Draped in soft blush tones and shimmering elegance. Featuring hand-selected rose quartz droplets, baroque river pearls, and delicate 18k gold vermeil floral motifs. Crafted to capture the gentle whisper of cherry blossoms in spring.",
      price: 8800, // $88.00
      compareAtPrice: 11000,
      stock: 9,
      lowStockThreshold: 3,
      sku: "AURA-EAR-001",
      status: "ACTIVE",
      featured: true,
      tags: "earrings,pearl,sakura,rose-gold,gemstone",
      craftDetails: "18k Gold Vermeil over recycled 925 sterling silver, genuine untreated morganite and freshwater coin pearls.",
      careInstructions: "Avoid direct contact with perfumes, hairsprays, and harsh chemicals. Store in the velvet pouch provided.",
      estimatedDispatchDays: 1,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
            altText: "Sakura Whisper Pearl & Morganite Earrings sparkling in soft light",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
            altText: "Earrings side profile on velvet cushion",
            isPrimary: false,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Metal Finish",
            option: "18k Rose Gold Vermeil",
            priceDelta: 0,
            stock: 5,
            sku: "AURA-EAR-RG",
          },
          {
            name: "Metal Finish",
            option: "18k Yellow Gold Vermeil",
            priceDelta: 0,
            stock: 4,
            sku: "AURA-EAR-YG",
          },
        ],
      },
    },
  });

  // Product 4: Moonlight Amethyst Blossom Necklace (Reference 3 item)
  const prod4 = await prisma.product.create({
    data: {
      storeId: auraStore.id,
      categoryId: catJewelry.id,
      title: "Moonlight Amethyst Blossom Necklace",
      slug: "moonlight-amethyst-blossom-necklace",
      description: "A talisman of serene intuition. Features an ethereal star-cut lilac amethyst gemstone encircled by diamond-cut crystal beads on an adjustable diamond-cut satellite chain.",
      price: 9500, // $95.00
      stock: 14,
      lowStockThreshold: 3,
      sku: "AURA-NECK-002",
      status: "ACTIVE",
      featured: true,
      tags: "necklace,amethyst,pendant,gold,vintage",
      craftDetails: "Faceted natural Brazilian amethyst, 18-inch adjustable 18k gold vermeil chain.",
      careInstructions: "Polish with gentle microfiber cloth.",
      estimatedDispatchDays: 2,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            altText: "Moonlight Amethyst Blossom Necklace",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    },
  });

  // Product 5: Wildflower Embroidery Starter Kit (Reference 2 item)
  const prod5 = await prisma.product.create({
    data: {
      storeId: makerbloomStore.id,
      categoryId: catCraftKits.id,
      title: "Wildflower Garden Embroidery Starter Kit",
      slug: "wildflower-garden-embroidery-kit",
      description: "Everything you need to stitch your own blooming meadow. Includes pre-printed organic linen fabric, a 7-inch beechwood hoop, 12 skeins of vibrant DMC cotton floss, Japanese embroidery needles, and a 24-page illustrated guide + HD video tutorial access.",
      price: 2800, // $28.00
      stock: 25,
      lowStockThreshold: 5,
      sku: "BLOOM-KIT-001",
      status: "ACTIVE",
      featured: true,
      tags: "diy,embroidery,kit,craft,wildflower,beginner",
      craftDetails: "100% Belgian linen fabric with water-soluble printed pattern, DMC French cotton floss, sustainable beechwood hoop.",
      careInstructions: "Once completed, rinse gently in lukewarm water to dissolve the ink guide, press flat with a warm iron.",
      estimatedDispatchDays: 1,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
            altText: "Wildflower Garden Embroidery Kit with hoop and colorful floss",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    },
  });

  // Product 6: CloudSoft Chunky Yarn Knitting Set (Reference 2 item)
  const prod6 = await prisma.product.create({
    data: {
      storeId: makerbloomStore.id,
      categoryId: catCraftKits.id,
      title: "CloudSoft Chunky Yarn Knitting Set",
      slug: "cloudsoft-chunky-yarn-knitting-set",
      description: "6 cozy, cloud-soft skeins of ultra-plush roving yarn in calming pastel sherbet shades. Includes circular bamboo knitting needles and a beginner scarf & beanie pattern.",
      price: 2400, // $24.00
      stock: 15,
      lowStockThreshold: 3,
      sku: "BLOOM-YARN-002",
      status: "ACTIVE",
      featured: true,
      tags: "yarn,knitting,pastel,wool,diy",
      craftDetails: "Hypoallergenic merino wool & bamboo fiber blend.",
      careInstructions: "Hand wash in cool water with wool-safe detergent, lay flat to dry.",
      estimatedDispatchDays: 1,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
            altText: "CloudSoft Chunky Yarn in pastel skeins",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    },
  });

  // Product 7: Wild Fig & Amber Coconut Candle
  const prod7 = await prisma.product.create({
    data: {
      storeId: botanicaStore.id,
      categoryId: catCandles.id,
      title: "Wild Fig & Amber Ceramic Vessel Candle",
      slug: "wild-fig-amber-ceramic-candle",
      description: "Ripe sun-drenched Mediterranean figs, crushed green leaves, and golden amber resins poured into a reusable handcrafted ceramic jar. Emits a cozy, crackling fireside ambient sound with its natural wooden wick.",
      price: 3800, // $38.00
      compareAtPrice: 4400,
      stock: 19,
      lowStockThreshold: 4,
      sku: "BOTAN-CND-001",
      status: "ACTIVE",
      featured: true,
      tags: "candle,coconut-wax,scented,wood-wick,fig,amber",
      craftDetails: "Clean coconut-soy wax, pure essential oil blend, natural wood wick, 65-hour burn time.",
      careInstructions: "Trim wood wick to 1/8 inch before each lighting. Allow melt pool to reach edges on first burn.",
      estimatedDispatchDays: 2,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80",
            altText: "Wild Fig candle in ceramic vessel glowing warm",
            isPrimary: true,
            order: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Size",
            option: "Standard 8 oz (45 hrs)",
            priceDelta: 0,
            stock: 11,
            sku: "BOTAN-CND-8OZ",
          },
          {
            name: "Size",
            option: "Deluxe 14 oz 2-Wick (75 hrs)",
            priceDelta: 1400,
            stock: 8,
            sku: "BOTAN-CND-14OZ",
          },
        ],
      },
    },
  });

  // Product 8: Boho Glass Bead Bracelet Making Kit (Reference 2 item)
  const prod8 = await prisma.product.create({
    data: {
      storeId: makerbloomStore.id,
      categoryId: catCraftKits.id,
      title: "Boho Glass Bead & Pearl Bracelet Kit",
      slug: "boho-glass-bead-bracelet-kit",
      description: "Over 800 Japanese Miyuki seed beads, freshwater baroque pearls, golden spacer beads, and durable stretch elastic cord to craft 6 personalized summer bracelets.",
      price: 2200,
      stock: 30,
      sku: "BLOOM-BEAD-003",
      status: "ACTIVE",
      featured: true,
      tags: "beads,jewelry-kit,bracelet,craft,diy",
      craftDetails: "Glass seed beads, genuine cultured pearls, brass accents.",
      careInstructions: "Roll bracelets over wrist gently rather than pulling.",
      estimatedDispatchDays: 1,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1611591475878-29e924b896fa?auto=format&fit=crop&w=800&q=80",
            altText: "Boho glass bead bracelet kit",
            isPrimary: true,
            order: 0,
          },
        ],
      },
    },
  });

  // 5. Create Reviews (Matches "What Our Makers Say" in Reference 2)
  await prisma.review.createMany({
    data: [
      {
        userId: customerUser.id,
        userName: "Kaylah L.",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        productId: prod5.id,
        rating: 5,
        title: "Thoughtfully designed and so relaxing",
        content: "These kits are so thoughtfully designed! The video tutorial made it easy to follow even for a total novice. The linen and thread quality is extraordinary.",
        verifiedPurchase: true,
      },
      {
        userId: customerUser.id,
        userName: "Daniel R.",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        productId: prod1.id,
        rating: 5,
        title: "The weight and glaze are perfection",
        content: "Amazing quality and beautiful tactile materials. Mitti Ceramics makes creativity and morning rituals feel genuinely intentional.",
        verifiedPurchase: true,
      },
      {
        userId: customerUser.id,
        userName: "Emily P.",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        productId: prod3.id,
        rating: 5,
        title: "Fast shipping, gorgeous sustainable packaging",
        content: "Fast shipping, exquisite heirloom quality. I have received compliments every single time I wear these earrings. Proud to support women-led independent makers!",
        verifiedPurchase: true,
      },
    ],
  });

  // 6. Create Demo Address & Order for Priya
  const address = await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: "Priya Sharma",
      street: "742 Evergreen Terrace",
      apartment: "Apt 4B",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "United States",
      phone: "+1 555-012-3456",
      isDefault: true,
    },
  });

  const demoOrder = await prisma.order.create({
    data: {
      orderNumber: "MM-202610-8421",
      userId: customerUser.id,
      subtotalAmount: 6200, // $62.00
      shippingAmount: 500, // $5.00
      taxAmount: 496, // $4.96
      totalAmount: 7196, // $71.96
      currency: "USD",
      status: "PROCESSING",
      paymentStatus: "PAID",
      paymentMethod: "TEST_CARD",
      paymentIntentId: "pi_demo_mittimuse_8921",
      shippingAddress: JSON.stringify(address),
      items: {
        create: [
          {
            storeId: mittiStore.id,
            productId: prod1.id,
            productTitle: "Hand-thrown Speckled Stoneware Mug",
            variantName: "Size: Regular (10 oz)",
            unitPrice: 3400,
            quantity: 1,
            totalPrice: 3400,
            fulfillmentStatus: "PROCESSING",
          },
          {
            storeId: makerbloomStore.id,
            productId: prod5.id,
            productTitle: "Wildflower Garden Embroidery Starter Kit",
            unitPrice: 2800,
            quantity: 1,
            totalPrice: 2800,
            fulfillmentStatus: "SHIPPED",
            trackingNumber: "USPS-9400-1020-3040",
            shippingCourier: "USPS Priority Mail",
          },
        ],
      },
    },
  });

  console.log(`✅ Seed successfully completed!`);
  console.log(`  - 1 Admin: admin@mittimuse.com (Password: Password123!)`);
  console.log(`  - 4 Artisan Stores: Mitti Ceramics, Aura Botanical Jewels, Botanica & Wick, MakerBloom Studio`);
  console.log(`  - 1 Customer: priya@example.com (Password: Password123!)`);
  console.log(`  - 1 Sample multi-vendor order: ${demoOrder.orderNumber}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
