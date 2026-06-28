/**
 * Centralized, type-safe access to environment variables.
 *
 * On Cloudflare Pages (edge runtime) env vars are injected into
 * `process.env` by next-on-pages, so reading from process.env works in both
 * Node and edge contexts. We validate lazily so missing optional vars don't
 * crash public pages that don't need them.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  get supabaseUrl(): string {
    return required("SUPABASE_URL");
  },
  get supabaseAnonKey(): string {
    return required("SUPABASE_ANON_KEY");
  },
  get supabaseServiceRoleKey(): string {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get adminEmail(): string {
    return required("ADMIN_EMAIL");
  },
  get adminPassword(): string {
    return required("ADMIN_PASSWORD");
  },
  /** Secret used to sign the admin session cookie. Falls back to a value
   *  derived from the admin password so the app still works if unset, but
   *  setting an explicit AUTH_SECRET is strongly recommended. */
  get authSecret(): string {
    return optional("AUTH_SECRET") ?? `${required("ADMIN_PASSWORD")}::anime-stream`;
  },
  get siteUrl(): string {
    return optional("NEXT_PUBLIC_SITE_URL") ?? optional("SITE_URL") ?? "https://example.com";
  },
} as const;

/** Public (browser-safe) values. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "",
} as const;
