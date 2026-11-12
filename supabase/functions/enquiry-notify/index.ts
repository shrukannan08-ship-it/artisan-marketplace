import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const body = await req.json();
    const { storeId, productId, senderName, senderEmail, senderPhone, subject, message } = body ?? {};

    if (!storeId || !senderName || !senderEmail || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Store, name, email, subject, and message are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: store } = await adminClient
      .from("stores")
      .select("id, store_name")
      .eq("id", storeId)
      .single();

    if (!store) {
      return new Response(JSON.stringify({ error: "Store not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: enquiry, error } = await adminClient
      .from("enquiries")
      .insert({
        store_id: storeId,
        product_id: productId || null,
        sender_name: String(senderName).trim(),
        sender_email: String(senderEmail).trim().toLowerCase(),
        sender_phone: senderPhone ? String(senderPhone).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
        status: "NEW",
      })
      .select("id, store_id, product_id, sender_name, sender_email, sender_phone, subject, message, status, created_at")
      .single();

    if (error) throw error;

    // Optional transactional email hook via Resend if RESEND_API_KEY is configured in Supabase Secrets
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      console.log(`Enquiry ${enquiry.id} logged for studio ${store.store_name} (email hook ready).`);
    }

    return new Response(JSON.stringify({ success: true, enquiry }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit enquiry";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
