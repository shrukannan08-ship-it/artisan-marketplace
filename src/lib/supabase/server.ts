import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "./config";

export async function createClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate cookies during render; middleware refreshes them.
        }
      },
    },
  });
}

/**
 * Public Supabase client without request cookies (safe for ISR / public SSR pages).
 */
export function createPublicClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createSupabaseJsClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a privileged Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Strictly server-only — never import in client components.
 */
export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() cannot run in the browser.");
  }
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase service-role key is not configured.");
  }

  return createSupabaseJsClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function callSupabaseEdgeFunction<T = unknown>(
  functionName: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    accessToken?: string | null;
  } = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 500, error: "Supabase not configured" };
  }

  const url = `${getSupabaseUrl()}/functions/v1/${functionName}`;
  const anonKey = getSupabaseAnonKey();
  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
    Authorization: `Bearer ${options.accessToken || anonKey}`,
  };

  try {
    const res = await fetch(url, {
      method: options.method ?? "POST",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: typeof payload?.error === "string" ? payload.error : `Edge function error (${res.status})`,
      };
    }

    return { ok: true, status: res.status, data: payload as T };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : "Failed to reach Supabase Edge Function",
    };
  }
}
