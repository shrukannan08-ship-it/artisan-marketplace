-- Mitti & Muse: Row Level Security (RLS) Policies for Public, Customer, Vendor (Owner), and Admin Roles

-- ==============================================================================
-- 1. Role & Ownership Helper Functions
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT role = 'ADMIN' FROM public.profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_vendor_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce((SELECT role IN ('OWNER', 'SELLER', 'ADMIN') FROM public.profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_store_owner(p_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = p_store_id AND s.user_id = auth.uid()
  );
$$;

-- ==============================================================================
-- 2. Enable RLS Across All Tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Profiles Policies
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 4. Stores Policies
-- ==============================================================================
DROP POLICY IF EXISTS "stores_select_public" ON public.stores;
CREATE POLICY "stores_select_public"
  ON public.stores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "stores_insert_vendor" ON public.stores;
CREATE POLICY "stores_insert_vendor"
  ON public.stores FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_vendor_or_admin());

DROP POLICY IF EXISTS "stores_update_owner_or_admin" ON public.stores;
CREATE POLICY "stores_update_owner_or_admin"
  ON public.stores FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "stores_delete_admin" ON public.stores;
CREATE POLICY "stores_delete_admin"
  ON public.stores FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- 5. Categories Policies
-- ==============================================================================
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "categories_admin_manage" ON public.categories;
CREATE POLICY "categories_admin_manage"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. Products, Images, and Variants Policies
-- ==============================================================================
DROP POLICY IF EXISTS "products_select_active_or_owner_or_admin" ON public.products;
CREATE POLICY "products_select_active_or_owner_or_admin"
  ON public.products FOR SELECT
  USING (
    status = 'ACTIVE'
    OR public.is_store_owner(store_id)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "products_insert_owner_or_admin" ON public.products;
CREATE POLICY "products_insert_owner_or_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_store_owner(store_id) OR public.is_admin());

DROP POLICY IF EXISTS "products_update_owner_or_admin" ON public.products;
CREATE POLICY "products_update_owner_or_admin"
  ON public.products FOR UPDATE
  USING (public.is_store_owner(store_id) OR public.is_admin())
  WITH CHECK (public.is_store_owner(store_id) OR public.is_admin());

DROP POLICY IF EXISTS "products_delete_owner_or_admin" ON public.products;
CREATE POLICY "products_delete_owner_or_admin"
  ON public.products FOR DELETE
  USING (public.is_store_owner(store_id) OR public.is_admin());

DROP POLICY IF EXISTS "product_images_select" ON public.product_images;
CREATE POLICY "product_images_select"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (p.status = 'ACTIVE' OR public.is_store_owner(p.store_id) OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "product_images_manage" ON public.product_images;
CREATE POLICY "product_images_manage"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (public.is_store_owner(p.store_id) OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND (public.is_store_owner(p.store_id) OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "product_variants_select" ON public.product_variants;
CREATE POLICY "product_variants_select"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND (p.status = 'ACTIVE' OR public.is_store_owner(p.store_id) OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "product_variants_manage" ON public.product_variants;
CREATE POLICY "product_variants_manage"
  ON public.product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND (public.is_store_owner(p.store_id) OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id
        AND (public.is_store_owner(p.store_id) OR public.is_admin())
    )
  );

-- ==============================================================================
-- 7. Collections Policies
-- ==============================================================================
DROP POLICY IF EXISTS "collections_select_public" ON public.collections;
CREATE POLICY "collections_select_public"
  ON public.collections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "collections_manage_owner_or_admin" ON public.collections;
CREATE POLICY "collections_manage_owner_or_admin"
  ON public.collections FOR ALL
  USING (public.is_store_owner(store_id) OR public.is_admin())
  WITH CHECK (public.is_store_owner(store_id) OR public.is_admin());

DROP POLICY IF EXISTS "collection_items_select_public" ON public.collection_items;
CREATE POLICY "collection_items_select_public"
  ON public.collection_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "collection_items_manage_owner_or_admin" ON public.collection_items;
CREATE POLICY "collection_items_manage_owner_or_admin"
  ON public.collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_items.collection_id
        AND (public.is_store_owner(c.store_id) OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_items.collection_id
        AND (public.is_store_owner(c.store_id) OR public.is_admin())
    )
  );

-- ==============================================================================
-- 8. Carts, Wishlist & Addresses Policies
-- ==============================================================================
DROP POLICY IF EXISTS "carts_manage_own" ON public.carts;
CREATE POLICY "carts_manage_own"
  ON public.carts FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "cart_items_manage_own" ON public.cart_items;
CREATE POLICY "cart_items_manage_own"
  ON public.cart_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts c
      WHERE c.id = cart_items.cart_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "wishlist_manage_own" ON public.wishlist_items;
CREATE POLICY "wishlist_manage_own"
  ON public.wishlist_items FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "addresses_manage_own" ON public.addresses;
CREATE POLICY "addresses_manage_own"
  ON public.addresses FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 9. Orders & Order Items Policies
--    (Order creation runs via SECURITY DEFINER create_order RPC / Edge Function)
-- ==============================================================================
DROP POLICY IF EXISTS "orders_select_customer_vendor_or_admin" ON public.orders;
CREATE POLICY "orders_select_customer_vendor_or_admin"
  ON public.orders FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = orders.id AND public.is_store_owner(oi.store_id)
    )
  );

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "order_items_select_customer_vendor_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_customer_vendor_or_admin"
  ON public.order_items FOR SELECT
  USING (
    public.is_store_owner(store_id)
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_update_vendor_or_admin" ON public.order_items;
CREATE POLICY "order_items_update_vendor_or_admin"
  ON public.order_items FOR UPDATE
  USING (public.is_store_owner(store_id) OR public.is_admin())
  WITH CHECK (public.is_store_owner(store_id) OR public.is_admin());

-- ==============================================================================
-- 10. Enquiries & Reviews Policies
-- ==============================================================================
DROP POLICY IF EXISTS "enquiries_insert_public" ON public.enquiries;
CREATE POLICY "enquiries_insert_public"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "enquiries_select_vendor_or_admin" ON public.enquiries;
CREATE POLICY "enquiries_select_vendor_or_admin"
  ON public.enquiries FOR SELECT
  USING (public.is_store_owner(store_id) OR public.is_admin());

DROP POLICY IF EXISTS "enquiries_update_vendor_or_admin" ON public.enquiries;
CREATE POLICY "enquiries_update_vendor_or_admin"
  ON public.enquiries FOR UPDATE
  USING (public.is_store_owner(store_id) OR public.is_admin())
  WITH CHECK (public.is_store_owner(store_id) OR public.is_admin());

DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_delete_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_own_or_admin"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin());
