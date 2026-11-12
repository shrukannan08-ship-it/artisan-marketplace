-- Mitti & Muse: Storage Buckets, Storage RLS Policies, and Transactional Server RPCs

-- ==============================================================================
-- 1. Storage Buckets (Product Images & Storefront Assets)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 2. Storage RLS Policies
-- ==============================================================================
DROP POLICY IF EXISTS "public_read_product_and_store_images" ON storage.objects;
CREATE POLICY "public_read_product_and_store_images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images', 'store-assets'));

DROP POLICY IF EXISTS "vendors_upload_own_folder_images" ON storage.objects;
CREATE POLICY "vendors_upload_own_folder_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'store-assets')
    AND public.is_vendor_or_admin()
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "vendors_update_own_folder_images" ON storage.objects;
CREATE POLICY "vendors_update_own_folder_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'store-assets')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "vendors_delete_own_folder_images" ON storage.objects;
CREATE POLICY "vendors_delete_own_folder_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'store-assets')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- ==============================================================================
-- 3. Atomic Order Creation RPC (Locks rows, checks stock, computes totals)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_items jsonb,
  p_customer_info jsonb,
  p_payment_method text DEFAULT 'TEST_CARD',
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_product record;
  v_variant record;
  v_qty integer;
  v_variant_id uuid;
  v_unit_price integer;
  v_line_total integer;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_tax integer := 0;
  v_total integer := 0;
  v_order_number text;
  v_order_id uuid;
  v_receipt_token uuid;
  v_effective_user_id uuid;
  v_shipping_address text;
  v_line_items jsonb := '[]'::jsonb;
  v_line jsonb;
  v_variant_label text;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty';
  END IF;

  IF p_customer_info IS NULL
     OR nullif(trim(coalesce(p_customer_info ->> 'fullName', '')), '') IS NULL
     OR nullif(trim(coalesce(p_customer_info ->> 'email', '')), '') IS NULL
     OR nullif(trim(coalesce(p_customer_info ->> 'street', '')), '') IS NULL
     OR nullif(trim(coalesce(p_customer_info ->> 'city', '')), '') IS NULL
     OR nullif(trim(coalesce(p_customer_info ->> 'postalCode', '')), '') IS NULL THEN
    RAISE EXCEPTION 'Please complete all required shipping details';
  END IF;

  -- Prevent impersonation when invoked from a user JWT
  IF auth.uid() IS NOT NULL THEN
    v_effective_user_id := auth.uid();
  ELSE
    v_effective_user_id := p_user_id;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := coalesce((v_item ->> 'quantity')::integer, 0);
    IF v_qty < 1 THEN
      RAISE EXCEPTION 'Invalid item quantity';
    END IF;

    SELECT id, store_id, title, price, stock, status
    INTO v_product
    FROM public.products
    WHERE id = (v_item ->> 'productId')::uuid
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % no longer exists', v_item ->> 'productId';
    END IF;

    IF v_product.status <> 'ACTIVE' THEN
      RAISE EXCEPTION '"%" is no longer available for purchase', v_product.title;
    END IF;

    v_unit_price := v_product.price;
    v_variant_id := NULL;
    v_variant_label := NULL;

    IF nullif(trim(coalesce(v_item ->> 'variantId', '')), '') IS NOT NULL THEN
      SELECT id, product_id, name, option, price_delta, stock
      INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item ->> 'variantId')::uuid AND product_id = v_product.id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected variant for "%" was not found', v_product.title;
      END IF;

      IF v_variant.stock < v_qty THEN
        RAISE EXCEPTION 'Only % left for % (%: %)', v_variant.stock, v_product.title, v_variant.name, v_variant.option;
      END IF;

      v_variant_id := v_variant.id;
      v_variant_label := v_variant.name || ': ' || v_variant.option;
      v_unit_price := v_unit_price + v_variant.price_delta;
    ELSE
      IF v_product.stock < v_qty THEN
        RAISE EXCEPTION 'Only % left for "%"', v_product.stock, v_product.title;
      END IF;
    END IF;

    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    v_line := jsonb_build_object(
      'store_id', v_product.store_id,
      'product_id', v_product.id,
      'variant_id', v_variant_id,
      'product_title', v_product.title,
      'variant_name', v_variant_label,
      'unit_price', v_unit_price,
      'quantity', v_qty,
      'total_price', v_line_total
    );
    v_line_items := v_line_items || v_line;
  END LOOP;

  -- Preserve exact pricing rules: free shipping at $50 (5000 cents), else $5.00; 8% tax
  IF v_subtotal >= 5000 THEN
    v_shipping := 0;
  ELSE
    v_shipping := 500;
  END IF;
  v_tax := round(v_subtotal * 0.08)::integer;
  v_total := v_subtotal + v_shipping + v_tax;

  v_order_number := 'MM-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_shipping_address := jsonb_build_object(
    'fullName', p_customer_info ->> 'fullName',
    'email', p_customer_info ->> 'email',
    'street', p_customer_info ->> 'street',
    'apartment', coalesce(p_customer_info ->> 'apartment', ''),
    'city', p_customer_info ->> 'city',
    'state', coalesce(p_customer_info ->> 'state', ''),
    'postalCode', p_customer_info ->> 'postalCode',
    'country', coalesce(p_customer_info ->> 'country', 'United States'),
    'phone', coalesce(p_customer_info ->> 'phone', '')
  )::text;

  INSERT INTO public.orders (
    order_number,
    user_id,
    guest_email,
    guest_name,
    subtotal_amount,
    shipping_amount,
    tax_amount,
    total_amount,
    currency,
    status,
    payment_status,
    payment_method,
    shipping_address
  )
  VALUES (
    v_order_number,
    v_effective_user_id,
    CASE WHEN v_effective_user_id IS NULL THEN p_customer_info ->> 'email' ELSE NULL END,
    CASE WHEN v_effective_user_id IS NULL THEN p_customer_info ->> 'fullName' ELSE NULL END,
    v_subtotal,
    v_shipping,
    v_tax,
    v_total,
    'USD',
    'PAID',
    'PAID',
    coalesce(nullif(p_payment_method, ''), 'TEST_CARD'),
    v_shipping_address
  )
  RETURNING id, receipt_token INTO v_order_id, v_receipt_token;

  FOR v_line IN SELECT * FROM jsonb_array_elements(v_line_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      store_id,
      product_id,
      variant_id,
      product_title,
      variant_name,
      unit_price,
      quantity,
      total_price,
      fulfillment_status
    )
    VALUES (
      v_order_id,
      (v_line ->> 'store_id')::uuid,
      (v_line ->> 'product_id')::uuid,
      nullif(v_line ->> 'variant_id', '')::uuid,
      v_line ->> 'product_title',
      v_line ->> 'variant_name',
      (v_line ->> 'unit_price')::integer,
      (v_line ->> 'quantity')::integer,
      (v_line ->> 'total_price')::integer,
      'PENDING'
    );

    IF nullif(v_line ->> 'variant_id', '') IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock = stock - (v_line ->> 'quantity')::integer
      WHERE id = (v_line ->> 'variant_id')::uuid;
    END IF;

    UPDATE public.products
    SET stock = greatest(0, stock - (v_line ->> 'quantity')::integer)
    WHERE id = (v_line ->> 'product_id')::uuid;
  END LOOP;

  -- Clear authenticated user's persisted cart after successful order
  IF v_effective_user_id IS NOT NULL THEN
    DELETE FROM public.cart_items
    WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id = v_effective_user_id);
  END IF;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'orderNumber', v_order_number,
    'receiptToken', v_receipt_token,
    'subtotalAmount', v_subtotal,
    'shippingAmount', v_shipping,
    'taxAmount', v_tax,
    'totalAmount', v_total,
    'status', 'PAID'
  );
END;
$$;

-- ==============================================================================
-- 4. Guest/Customer Order Receipt RPC (Protected by owner or receipt_token)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_order_receipt(
  p_order_id uuid,
  p_receipt_token uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_items jsonb;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF NOT (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND v_order.user_id = auth.uid())
    OR (p_receipt_token IS NOT NULL AND v_order.receipt_token = p_receipt_token)
  ) THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', oi.id,
        'orderId', oi.order_id,
        'storeId', oi.store_id,
        'productId', oi.product_id,
        'variantId', oi.variant_id,
        'productTitle', oi.product_title,
        'variantName', oi.variant_name,
        'unitPrice', oi.unit_price,
        'quantity', oi.quantity,
        'totalPrice', oi.total_price,
        'fulfillmentStatus', oi.fulfillment_status,
        'trackingNumber', oi.tracking_number,
        'shippingCourier', oi.shipping_courier,
        'store', jsonb_build_object(
          'id', s.id,
          'storeName', s.store_name,
          'slug', s.slug
        ),
        'product', jsonb_build_object(
          'id', p.id,
          'slug', p.slug,
          'title', p.title,
          'images', coalesce(
            (
              SELECT jsonb_agg(jsonb_build_object('url', pi.url, 'altText', pi.alt_text, 'isPrimary', pi.is_primary) ORDER BY pi.display_order)
              FROM public.product_images pi WHERE pi.product_id = p.id
            ),
            '[]'::jsonb
          )
        )
      )
    ),
    '[]'::jsonb
  )
  INTO v_items
  FROM public.order_items oi
  JOIN public.stores s ON s.id = oi.store_id
  JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id', v_order.id,
    'orderNumber', v_order.order_number,
    'userId', v_order.user_id,
    'guestEmail', v_order.guest_email,
    'guestName', v_order.guest_name,
    'subtotalAmount', v_order.subtotal_amount,
    'shippingAmount', v_order.shipping_amount,
    'taxAmount', v_order.tax_amount,
    'totalAmount', v_order.total_amount,
    'currency', v_order.currency,
    'status', v_order.status,
    'paymentStatus', v_order.payment_status,
    'paymentMethod', v_order.payment_method,
    'shippingAddress', v_order.shipping_address,
    'createdAt', v_order.created_at,
    'items', v_items
  );
END;
$$;

-- ==============================================================================
-- 5. Seller Dashboard Stats RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_seller_stats(p_store_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_products integer;
  v_active_products integer;
  v_total_revenue bigint;
  v_order_count integer;
  v_pending_orders integer;
  v_unread_enquiries integer;
  v_low_stock jsonb;
BEGIN
  IF NOT (public.is_store_owner(p_store_id) OR public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE status = 'ACTIVE')
  INTO v_total_products, v_active_products
  FROM public.products
  WHERE store_id = p_store_id;

  SELECT
    coalesce(sum(total_price) FILTER (WHERE fulfillment_status <> 'CANCELLED'), 0),
    count(*),
    count(*) FILTER (WHERE fulfillment_status = 'PENDING')
  INTO v_total_revenue, v_order_count, v_pending_orders
  FROM public.order_items
  WHERE store_id = p_store_id;

  SELECT count(*)
  INTO v_unread_enquiries
  FROM public.enquiries
  WHERE store_id = p_store_id AND status = 'NEW';

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'stock', stock,
        'lowStockThreshold', low_stock_threshold
      )
      ORDER BY stock ASC
    ),
    '[]'::jsonb
  )
  INTO v_low_stock
  FROM (
    SELECT id, title, stock, low_stock_threshold
    FROM public.products
    WHERE store_id = p_store_id AND stock <= 5
    ORDER BY stock ASC
    LIMIT 5
  ) sub;

  RETURN jsonb_build_object(
    'totalProducts', v_total_products,
    'activeProducts', v_active_products,
    'totalRevenue', v_total_revenue,
    'orderCount', v_order_count,
    'pendingOrders', v_pending_orders,
    'unreadEnquiries', v_unread_enquiries,
    'lowStockProducts', v_low_stock
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(jsonb, jsonb, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_receipt(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_seller_stats(uuid) TO authenticated;
