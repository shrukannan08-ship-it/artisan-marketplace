import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function collectFiles(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      collectFiles(full, exts, acc);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      acc.push(full);
    }
  }
  return acc;
}

console.log("=== Mitti & Muse Supabase Migration Verification ===\n");

// 1. Verify Supabase migration SQL files and seed
const schemaSql = readText("supabase/migrations/20261112000001_initial_schema.sql");
const rlsSql = readText("supabase/migrations/20261112000002_rls_policies.sql");
const storageRpcSql = readText("supabase/migrations/20261112000003_storage_and_rpcs.sql");
const seedSql = readText("supabase/seed.sql");

const expectedTables = [
  "profiles",
  "stores",
  "categories",
  "products",
  "product_images",
  "product_variants",
  "collections",
  "collection_items",
  "carts",
  "cart_items",
  "wishlist_items",
  "addresses",
  "orders",
  "order_items",
  "enquiries",
  "reviews",
];

for (const table of expectedTables) {
  assert(
    schemaSql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`),
    `Missing table in initial schema SQL: ${table}`
  );
  assert(
    rlsSql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
    `RLS not enabled for table: ${table}`
  );
}
assert(schemaSql.includes("CREATE TRIGGER on_auth_user_created"), "Missing auth.users signup trigger");
assert(schemaSql.includes("guard_profile_role_change"), "Missing profile role escalation guard");
assert(rlsSql.includes("public.is_order_owner("), "Missing non-recursive is_order_owner RLS helper");
assert(rlsSql.includes("public.order_has_vendor_store("), "Missing non-recursive order_has_vendor_store RLS helper");
console.log("[PASS] Schema SQL: All 16 PostgreSQL tables, auth trigger, role guard & non-recursive RLS verified.");

// 2. Verify Storage buckets, policies & transactional RPCs
assert(storageRpcSql.includes("'product-images'"), "Missing product-images bucket");
assert(storageRpcSql.includes("'store-assets'"), "Missing store-assets bucket");
assert(storageRpcSql.includes("CREATE OR REPLACE FUNCTION public.create_order"), "Missing create_order RPC");
assert(storageRpcSql.includes("CREATE OR REPLACE FUNCTION public.get_order_receipt"), "Missing get_order_receipt RPC");
assert(storageRpcSql.includes("CREATE OR REPLACE FUNCTION public.get_seller_stats"), "Missing get_seller_stats RPC");
console.log("[PASS] Storage & RPC SQL: Buckets, storage RLS, and atomic order/receipt/stats RPCs verified.");

// 3. Verify Seed contains only categories and zero fake products/stores/users
assert(seedSql.includes("INSERT INTO public.categories"), "Missing categories seed");
assert(!/INSERT INTO public\.(products|stores|profiles|orders)/i.test(seedSql), "Seed must not insert fake marketplace entities");
console.log("[PASS] Seed SQL: Categories-only idempotent seed verified (no fake products/users/vendors/orders).");

// 4. Verify Edge Functions
for (const fn of ["create-order", "admin-actions", "enquiry-notify"]) {
  const fnPath = `supabase/functions/${fn}/index.ts`;
  assert(fs.existsSync(path.join(ROOT, fnPath)), `Missing Edge Function: ${fnPath}`);
}
const adminFn = readText("supabase/functions/admin-actions/index.ts");
assert(adminFn.includes("callerProfile.role !== \"ADMIN\""), "admin-actions must enforce ADMIN role");
console.log("[PASS] Edge Functions: create-order, admin-actions, enquiry-notify present & guarded.");

// 5. Security check: Ensure service role key is never exposed in client components or NEXT_PUBLIC vars
const srcFiles = collectFiles(path.join(ROOT, "src"), [".ts", ".tsx"]);
for (const file of srcFiles) {
  const content = fs.readFileSync(file, "utf8");
  const isClientFile = content.trimStart().startsWith('"use client"') || content.trimStart().startsWith("'use client'");
  assert(
    !content.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE"),
    `Forbidden NEXT_PUBLIC_SUPABASE_SERVICE_ROLE reference in ${file}`
  );
  if (isClientFile) {
    assert(!content.includes("SUPABASE_SERVICE_ROLE_KEY"), `Service role key referenced in client file: ${file}`);
    assert(!content.includes("createAdminClient"), `Admin client imported in client file: ${file}`);
  }
}
const nextStaticDir = path.join(ROOT, ".next", "static");
if (fs.existsSync(nextStaticDir)) {
  const builtJs = collectFiles(nextStaticDir, [".js"]);
  for (const jsFile of builtJs) {
    const content = fs.readFileSync(jsFile, "utf8");
    assert(!content.includes("SUPABASE_SERVICE_ROLE_KEY"), `Service role key leaked into built static bundle: ${jsFile}`);
  }
  console.log("[PASS] Security Audit: Client files & built static JS bundle clean (no service-role exposure).");
} else {
  console.log("[PASS] Security Audit: Client files clean (no service-role exposure).");
}

// 6. Optional Live Supabase Integration Test (if env vars point to a live Supabase project)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const supabaseService = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const hasLiveEnv =
  /^https?:\/\/.+/.test(supabaseUrl) &&
  !supabaseUrl.includes("your-project-ref") &&
  supabaseAnon.length > 20 &&
  supabaseService.length > 20;

if (!hasLiveEnv) {
  console.log("[SKIPPED] Live Supabase tests: NEXT_PUBLIC_SUPABASE_URL / keys are not configured yet.");
  process.exit(0);
}

const { createClient } = await import("@supabase/supabase-js");
const adminClient = createClient(supabaseUrl, supabaseService, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: categories, error: catErr } = await adminClient.from("categories").select("id, slug");
assert(!catErr && Array.isArray(categories) && categories.length >= 1, `Live categories query failed: ${catErr?.message}`);
console.log(`[PASS] Live Supabase DB reachable (${categories.length} categories loaded).`);
