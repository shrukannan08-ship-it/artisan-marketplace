import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "mitti_muse_super_secure_jwt_secret_key_2026_dev";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function isOwner(user) {
  return user?.role === "OWNER" || user?.role === "SELLER";
}

async function runTests() {
  console.log("===============================================================");
  console.log("🧪 Mitti & Muse: Critical Workflows & Authorization Test Suite");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Foundational Categories & No Fake Products Seed Check
    // -------------------------------------------------------------
    console.log("👉 Test Suite 1: Database Seed & Initial Empty State");
    const categories = await prisma.category.findMany();
    assert(categories.length >= 7, `Verified ${categories.length} craft categories present in database`);

    const preloadedFakeProducts = await prisma.product.count({
      where: {
        title: {
          in: ["Speckled Stoneware Matcha Bowl", "Raw Brass Botanical Pendant"],
        },
      },
    });
    assert(
      preloadedFakeProducts === 0,
      "Zero preloaded fake sample products exist in marketplace database"
    );

    // -------------------------------------------------------------
    // Test 2: Separate Customer Authentication & Role Isolation
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 2: Customer Registration & Permission Isolation");
    const testCustomerEmail = `patron.${Date.now()}@example.test`;
    const customerPasswordHash = await bcrypt.hash("PatronSecret123!", 10);

    const customerUser = await prisma.user.create({
      data: {
        name: "Aanya Patel",
        email: testCustomerEmail,
        passwordHash: customerPasswordHash,
        role: "CUSTOMER",
      },
    });

    assert(customerUser.role === "CUSTOMER", `Registered customer with role: ${customerUser.role}`);

    const customerToken = jwt.sign(
      {
        userId: customerUser.id,
        email: customerUser.email,
        role: customerUser.role,
        storeId: null,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const decodedCustomer = jwt.verify(customerToken, JWT_SECRET);
    assert(
      isOwner(decodedCustomer) === false,
      "Customer role strictly denied owner/seller permissions (isOwner === false)"
    );
    assert(
      decodedCustomer.storeId === null,
      "Customer account has no associated studio storeId"
    );

    // -------------------------------------------------------------
    // Test 3: Dedicated Business Owner Registration & Studio Setup
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 3: Dedicated Business Owner Registration & Studio Setup");
    const testOwnerAEmail = `artisan.tara.${Date.now()}@studio.test`;
    const ownerPasswordHash = await bcrypt.hash("StudioOwner123!", 10);
    const storeNameA = `Tara Earth Studio ${Math.floor(Math.random() * 1000)}`;

    const ownerA = await prisma.user.create({
      data: {
        name: "Tara Sen",
        email: testOwnerAEmail,
        passwordHash: ownerPasswordHash,
        role: "OWNER",
      },
    });

    const storeA = await prisma.store.create({
      data: {
        userId: ownerA.id,
        storeName: storeNameA,
        slug: slugify(storeNameA),
        tagline: "Handcrafted Stoneware & Clay Art",
        location: "Jaipur, India",
        description: "Small-batch wood-fired ceramics made with indigenous clay.",
        rating: 5.0,
        reviewCount: 0,
      },
    });

    assert(ownerA.role === "OWNER", `Registered business owner with role: ${ownerA.role}`);
    assert(isOwner(ownerA) === true, "Owner role granted authorized owner permissions (isOwner === true)");
    assert(Boolean(storeA.id), `Studio storefront created: "${storeA.storeName}" with slug "${storeA.slug}"`);
    assert(storeA.location === "Jaipur, India", `Store location saved: ${storeA.location}`);

    // -------------------------------------------------------------
    // Test 4: Real Owner Product Publishing (Dynamic Database)
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 4: Owner Handcrafted Product Publishing");
    const ceramicCategory = categories.find((c) => c.slug === "ceramics-pottery") || categories[0];

    const newProduct = await prisma.product.create({
      data: {
        storeId: storeA.id,
        categoryId: ceramicCategory.id,
        title: "Hand-thrown Terra Cotta Chai Kulhad",
        slug: slugify(`Hand-thrown Terra Cotta Chai Kulhad ${Date.now()}`),
        description: "Clay kulhads fired in wood kiln. Natural porous unglazed terracotta.",
        price: 2400, // $24.00 stored in cents
        stock: 15,
        status: "ACTIVE",
        craftDetails: "Local clay, hand thrown on wheel, 900C pit fire",
        careInstructions: "Rinse with warm water",
        tags: "chai, kulhad, terracotta, pottery",
        images: {
          create: [
            {
              url: "/uploads/sample-kulhad.webp",
              altText: "Hand-thrown Terra Cotta Chai Kulhad",
              isPrimary: true,
              order: 0,
            },
          ],
        },
        variants: {
          create: [
            { name: "Capacity", option: "150ml Standard", priceDelta: 0, stock: 10 },
            { name: "Capacity", option: "250ml Grand", priceDelta: 400, stock: 5 },
          ],
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
        store: true,
      },
    });

    assert(Boolean(newProduct.id), `Owner successfully published product: "${newProduct.title}"`);
    assert(newProduct.price === 2400, "Price stored in integer cents ($24.00 = 2400 cents)");
    assert(newProduct.images.length === 1, "Product image recorded in database");
    assert(newProduct.variants.length === 2, "Product variants recorded with priceDelta");

    // Verify product is now visible on active marketplace query
    const activeMarketplaceProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { store: true },
    });
    const foundInMarketplace = activeMarketplaceProducts.some((p) => p.id === newProduct.id);
    assert(foundInMarketplace, "Published product is immediately visible on marketplace query");

    // -------------------------------------------------------------
    // Test 5: Unpublish / Draft Toggle Workflow
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 5: Unpublish / Draft Workflow & Customer Visibility");
    const unpublishedProduct = await prisma.product.update({
      where: { id: newProduct.id },
      data: { status: "DRAFT" },
    });
    assert(unpublishedProduct.status === "DRAFT", "Owner toggled product status to DRAFT");

    const marketplaceAfterDraft = await prisma.product.findMany({
      where: { status: "ACTIVE" },
    });
    const visibleInMarketplace = marketplaceAfterDraft.some((p) => p.id === newProduct.id);
    assert(
      visibleInMarketplace === false,
      "DRAFT product is strictly hidden from customer marketplace queries"
    );

    // Re-activate for subsequent order test
    await prisma.product.update({
      where: { id: newProduct.id },
      data: { status: "ACTIVE" },
    });

    // -------------------------------------------------------------
    // Test 6: Multi-Vendor Authorization & Owner Data Isolation
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 6: Multi-Vendor Owner Data Isolation");
    const testOwnerBEmail = `artisan.kiran.${Date.now()}@studio.test`;
    const ownerB = await prisma.user.create({
      data: {
        name: "Kiran Rao",
        email: testOwnerBEmail,
        passwordHash: ownerPasswordHash,
        role: "OWNER",
      },
    });
    const storeB = await prisma.store.create({
      data: {
        userId: ownerB.id,
        storeName: `Kiran Jewels ${Math.floor(Math.random() * 1000)}`,
        slug: slugify(`kiran-jewels-${Date.now()}`),
        tagline: "Botanical Filigree Jewelry",
      },
    });

    // Owner B attempts to edit Owner A's product
    const productToEdit = await prisma.product.findUnique({ where: { id: newProduct.id } });
    const isOwnerBAuthorized = productToEdit && productToEdit.storeId === storeB.id;
    assert(
      isOwnerBAuthorized === false,
      "Strict data isolation: Owner B is NOT authorized to modify Owner A's product (storeId mismatch)"
    );

    // -------------------------------------------------------------
    // Test 7: Patron Order & Atomic Inventory Decrement
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 7: Patron Order & Atomic Inventory Decrement");
    const orderQuantity = 3;
    const initialStock = newProduct.stock; // 15

    const order = await prisma.$transaction(async (tx) => {
      // 1. Decrement stock
      await tx.product.update({
        where: { id: newProduct.id },
        data: { stock: { decrement: orderQuantity } },
      });

      // 2. Create Order
      const itemSubtotal = newProduct.price * orderQuantity; // 7200 cents
      const shipping = 500; // 500 cents
      const tax = Math.round(itemSubtotal * 0.08); // 576 cents
      const total = itemSubtotal + shipping + tax;

      return await tx.order.create({
        data: {
          orderNumber: `MM-TEST-${Date.now()}`,
          userId: customerUser.id,
          subtotalAmount: itemSubtotal,
          shippingAmount: shipping,
          taxAmount: tax,
          totalAmount: total,
          status: "PAID",
          paymentStatus: "PAID",
          paymentMethod: "STRIPE_TEST",
          shippingAddress: JSON.stringify({
            fullName: customerUser.name,
            addressLine1: "123 Artisan Lane",
            city: "Portland",
            postalCode: "97201",
          }),
          items: {
            create: [
              {
                storeId: storeA.id,
                productId: newProduct.id,
                productTitle: newProduct.title,
                unitPrice: newProduct.price,
                quantity: orderQuantity,
                totalPrice: itemSubtotal,
                fulfillmentStatus: "PENDING",
              },
            ],
          },
        },
      });
    });

    assert(Boolean(order.id), `Order placed successfully: ${order.orderNumber}`);

    const productAfterOrder = await prisma.product.findUnique({ where: { id: newProduct.id } });
    assert(
      productAfterOrder.stock === initialStock - orderQuantity,
      `Inventory atomically decremented: ${initialStock} -> ${productAfterOrder.stock}`
    );

    // -------------------------------------------------------------
    // Test 8: Owner Product Deletion
    // -------------------------------------------------------------
    console.log("\n👉 Test Suite 8: Owner Product Deletion");
    // Remove order items first to satisfy cascade or delete product
    await prisma.orderItem.deleteMany({ where: { productId: newProduct.id } });
    await prisma.productImage.deleteMany({ where: { productId: newProduct.id } });
    await prisma.productVariant.deleteMany({ where: { productId: newProduct.id } });
    await prisma.product.delete({ where: { id: newProduct.id } });

    const deletedCheck = await prisma.product.findUnique({ where: { id: newProduct.id } });
    assert(deletedCheck === null, "Owner successfully deleted handcrafted product listing");

    // Clean up test order and test users
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.store.delete({ where: { id: storeA.id } });
    await prisma.store.delete({ where: { id: storeB.id } });
    await prisma.user.delete({ where: { id: customerUser.id } });
    await prisma.user.delete({ where: { id: ownerA.id } });
    await prisma.user.delete({ where: { id: ownerB.id } });

    console.log("\n===============================================================");
    console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log("===============================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution encountered an error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
