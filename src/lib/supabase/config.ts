export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

export function getSupabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

export function getSupabaseServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must never be accessed in browser code.");
  }
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  return (
    /^https?:\/\/.+/.test(url) &&
    !url.includes("your-project-ref") &&
    anonKey.length > 20 &&
    !anonKey.includes("your-anon-key")
  );
}

export function isSupabaseAdminConfigured(): boolean {
  if (typeof window !== "undefined") return false;
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  return (
    isSupabaseConfigured() &&
    serviceKey.length > 20 &&
    !serviceKey.includes("your-service-role-key")
  );
}
