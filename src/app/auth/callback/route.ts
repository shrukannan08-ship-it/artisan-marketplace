import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const safeNext = next.startsWith("/") ? next : "/";
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    } catch (err) {
      console.error("Supabase auth callback error:", err);
    }
  }

  return NextResponse.redirect(`${origin}/auth/customer/login?error=auth_callback_failed`);
}
