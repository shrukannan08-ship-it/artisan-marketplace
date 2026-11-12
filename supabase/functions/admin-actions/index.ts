import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: caller },
      error: authError,
    } = await callerClient.auth.getUser();

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (!callerProfile || callerProfile.role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET") {
      const [profilesRes, storesRes, productsRes, ordersRes] = await Promise.all([
        adminClient.from("profiles").select("id, name, email, role, created_at").order("created_at", { ascending: false }).limit(50),
        adminClient.from("stores").select("id, user_id, store_name, slug, location, featured, created_at").order("created_at", { ascending: false }).limit(50),
        adminClient.from("products").select("id, title, slug, status, featured, price, stock, store_id").order("created_at", { ascending: false }).limit(50),
        adminClient.from("orders").select("id, order_number, total_amount, status, payment_status, created_at").order("created_at", { ascending: false }).limit(50),
      ]);

      return new Response(
        JSON.stringify({
          profiles: profilesRes.data ?? [],
          stores: storesRes.data ?? [],
          products: productsRes.data ?? [],
          orders: ordersRes.data ?? [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body ?? {};

      if (action === "toggle_store_featured") {
        const { storeId, featured } = body;
        const { data, error } = await adminClient
          .from("stores")
          .update({ featured: Boolean(featured) })
          .eq("id", storeId)
          .select("id, featured")
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, store: data }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "toggle_product_featured") {
        const { productId, featured } = body;
        const { data, error } = await adminClient
          .from("products")
          .update({ featured: Boolean(featured) })
          .eq("id", productId)
          .select("id, featured")
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, product: data }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "update_user_role") {
        const { userId, role } = body;
        if (!["CUSTOMER", "OWNER", "SELLER", "ADMIN"].includes(role)) {
          return new Response(JSON.stringify({ error: "Invalid role" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (userId === caller.id && role !== "ADMIN") {
          return new Response(JSON.stringify({ error: "Cannot demote your own admin account" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await adminClient
          .from("profiles")
          .update({ role })
          .eq("id", userId)
          .select("id, role")
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, profile: data }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unsupported action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin action failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
