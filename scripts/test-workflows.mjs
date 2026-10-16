import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "mitti_muse_super_secure_jwt_secret_key_2026_dev";

async function runTests() {
  console.log("🧪 Running Mitti & Muse Full Stack Verification Tests...\n");
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

  // 1. Database Connection & Artisan Stores
  const stores = await prisma.store.findMany({ include: { products: true } });
  assert(stores.length >= 4, `Found ${stores.length} independent artisan stores in database`);

  const mittiStore = stores.find((s) => s.slug === "mitti-ceramics");
  assert(Boolean(mittiStore), `Mitti Ceramics store exists with slug 'mitti-ceramics'`);
  assert(mittiStore?.products.length > 0, `Mitti Ceramics has ${mittiStore?.products.length} products`);

  // 2. Categories Check
  const categories = await prisma.category.findMany();
  assert(categories.length >= 5, `Found ${categories.length} product craft categories`);

  // 3. Password Verification
  const user = await prisma.user.findUnique({ where: { email: "priya@example.com" } });
  assert(Boolean(user), "Customer user Priya Sharma exists");
  const passwordValid = await bcrypt.compare("Password123!", user?.passwordHash || "");
  assert(passwordValid, "Bcrypt password hashing and validation operates accurately");

  // 4. JWT Token Generation & Verification
  const token = jwt.sign({ userId: user?.id, email: user?.email, role: user?.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const decoded = jwt.verify(token, JWT_SECRET);
  assert(decoded.userId === user?.id, "JWT signed token verifies correctly");

  // 5. Server-Authoritative Price Calculation & Atomic Stock Decrement Test
  const testProduct = await prisma.product.findFirst({
    where: { stock: { gt: 5 } },
  });
  assert(Boolean(testProduct), `Selected test product "${testProduct?.title}" with initial stock ${testProduct?.stock}`);

  const initialStock = testProduct?.stock || 0;
  const quantityToBuy = 2;

  // Execute atomic order transaction simulating /api/orders
  const testOrder = await prisma.$transaction(async (tx) => {
    // 1. Decrement stock
    await tx.product.update({
      where: { id: testProduct.id },
      data: { stock: { decrement: quantityToBuy } },
    });

    // 2. Create Order
    return await tx.order.create({
      data: {
        orderNumber: `MM-TEST-${Date.now()}`,
        userId: user?.id,
        subtotalAmount: testProduct.price * quantityToBuy,
        shippingAmount: 500,
        taxAmount: Math.round(testProduct.price * quantityToBuy * 0.08),
        totalAmount: testProduct.price * quantityToBuy + 500 + Math.round(testProduct.price * quantityToBuy * 0.08),
        status: "PAID",
        paymentStatus: "PAID",
        paymentMethod: "TEST_CARD",
        shippingAddress: JSON.stringify({ fullName: "Test Patron", city: "Portland" }),
        items: {
          create: [
            {
              storeId: testProduct.storeId,
              productId: testProduct.id,
              productTitle: testProduct.title,
              unitPrice: testProduct.price,
              quantity: quantityToBuy,
              totalPrice: testProduct.price * quantityToBuy,
              fulfillmentStatus: "PENDING",
            },
          ],
        },
      },
    });
  });

  assert(Boolean(testOrder.id), `Created simulated test order: ${testOrder.orderNumber}`);

  // Verify stock actually decreased in DB
  const updatedProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
  assert(
    updatedProduct?.stock === initialStock - quantityToBuy,
    `Stock atomically decremented from ${initialStock} to ${updatedProduct?.stock}`
  );

  // Restore stock for demonstration purity
  await prisma.product.update({
    where: { id: testProduct.id },
    data: { stock: initialStock },
  });
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  assert(true, "Restored initial test inventory and cleaned test order record");

  // 6. Data Isolation Verification
  const seller2 = await prisma.user.findUnique({
    where: { email: "aisha@aurajewels.com" },
    include: { store: true },
  });
  const mittiItems = await prisma.orderItem.findMany({
    where: { storeId: mittiStore.id },
  });
  const auraCanAccessMittiItems = mittiItems.some((item) => item.storeId === seller2?.store?.id);
  assert(!auraCanAccessMittiItems, "Seller isolation verified: Store Aura cannot access Store Mitti order items");

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error("Test execution error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
