import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

let cachedClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  if (!cachedClient) {
    cachedClient = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return cachedClient;
}
