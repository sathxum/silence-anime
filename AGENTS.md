# AGENTS.md — AniLux anime streaming platform

Production Next.js 15 (App Router) anime streaming site deployed to Cloudflare
Pages with a Supabase Postgres backend. No public auth; a single env-gated
`/admin` dashboard.

## Architecture
- `src/app/(site)/` — public pages (home, anime detail). Share navbar/footer layout.
- `src/app/admin/` — admin dashboard (client layout w/ sidebar; `/admin/login` is full-bleed).
- `src/app/api/` — Hono-free Next route handlers, all `runtime = "edge"`.
- `src/middleware.ts` — gates `/admin/*` and `/api/admin/*` via signed HMAC session cookie.
- `src/services/` — server-only data access (`server-only` guard). `anime.service.ts`, `stats.service.ts`.
- `src/lib/` — `env`, `auth` (Web Crypto HMAC), `supabase` clients, `validation` (zod), `rate-limit`, `utils`, `admin-api` (client fetch wrapper).
- `src/types/index.ts` — single source of truth for shapes. No `any` anywhere (eslint-enforced).

## Key conventions
- All API + data-fetching pages use `export const runtime = "edge"` (Cloudflare requirement).
- Public reads in services are wrapped in `safe()` so a DB outage degrades to empty states, not 500s.
- Episode clicks: `POST /api/track` → `record_episode_click` RPC (atomic insert + counter bump) → browser redirects to external link. Player is never embedded.
- "Hindi Dub" badge is applied automatically (`is_hindi_dub` defaults true).
- Themes: `dark` (default) + `silver`, toggled via `next-themes` class on `<html>`; tokens in `src/styles/globals.css`.

## Env vars (runtime)
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET (recommended), NEXT_PUBLIC_SITE_URL (recommended for SEO/sitemap).

## Database
- `supabase/setup.sql` — paste-into-SQL-Editor bundle (idempotent). Or `supabase/migrations/*` via `node scripts/migrate.mjs` (needs SUPABASE_DB_PASSWORD or SUPABASE_DB_URL).
- `supabase/seed.sql` — optional sample catalogue.

## Commands
- `npm run dev` — local dev (needs `.env.local`).
- `npm run pages:build` — Cloudflare next-on-pages build (the real deploy target; always verify this, not just `next build`).
- `npx tsc --noEmit` — typecheck.

## Pinned versions (do not bump blindly)
- Next 15.5.2 (capped by `@cloudflare/next-on-pages` ≤15.5.2), React 19, Tailwind 3.4.
- Bumping Next past 15.5.2 breaks next-on-pages; migrate to the OpenNext Cloudflare adapter instead.
