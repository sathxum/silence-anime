import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, publicEnv } from "@/lib/env";

/**
 * Browser/anon client — used by public pages and client components.
 * Respects Row Level Security. Read-only against published content.
 */
export function createBrowserSupabase(): SupabaseClient {
  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server anon client — for server components / route handlers that only
 * need public read access.
 */
export function createServerSupabase(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — bypasses RLS. Only ever instantiated inside
 * server-side admin route handlers that have already verified the admin
 * session. NEVER import this into a client component.
 */
export function createServiceSupabase(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
