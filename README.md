# AniLux — Premium Anime Streaming Platform

A production-ready anime streaming website. Premium glassmorphism UI (dark +
silver themes), a SaaS-grade admin dashboard with per-link click analytics,
and a fully edge-deployed backend. No user signup/login — only a single
protected `/admin` route gated by environment-variable credentials.

> **Note on "streaming":** episode play buttons **redirect** to the external
> links you provide (they are not embedded). Every click is tracked so the
> admin dashboard can show which anime and which specific links get the most
> plays.

---

## Tech stack

| Layer       | Choice                                                        |
| ----------- | ------------------------------------------------------------- |
| Framework   | Next.js 15 (App Router) + React 19 + TypeScript (strict)      |
| Styling     | TailwindCSS 3 + shadcn-style primitives + Framer Motion       |
| Icons       | lucide-react                                                  |
| Drag & drop | @dnd-kit (episode reordering)                                 |
| Backend     | Cloudflare Pages (edge runtime) + Hono-style route handlers   |
| Database    | Supabase PostgreSQL (with Row Level Security)                 |
| Auth        | Stateless HMAC-signed admin session cookie (Web Crypto)       |
| Validation  | Zod on every write endpoint                                   |

Everything runs on Cloudflare's edge — page routes, API routes, and
middleware are all `runtime = "edge"`.

---

## What you get

**Public site**
- Animated hero banner (auto-rotating featured anime)
- Featured / Trending / Latest / Recently-added rows + full grid
- 3D-tilt anime cards with hover glow, lazy-loaded optimized posters
- Anime details page with episode list, automatic **"Hindi Dub"** badge,
  and play buttons that track clicks then redirect
- Instant, debounced, realtime search (no page reload)
- Dark theme + Silver/White luxury theme toggle
- Full SEO: dynamic metadata, Open Graph, Twitter cards, JSON-LD structured
  data, `robots.txt`, `sitemap.xml`, canonical URLs

**Admin dashboard (`/admin`)**
- Premium animated sidebar, fully responsive
- Overview: total anime, total episodes, total link clicks, recently added,
  most-clicked anime, quick actions
- Anime manager: add / edit / delete with search, pagination, confirmation
  dialogs, loading states, empty states, success toasts
- Live poster/banner image preview while typing
- Episode manager per anime: add / edit / delete + **drag-and-drop ordering**
- **Link analytics:** see how many clicks each anime got and exactly which
  episode link was clicked how many times

---

## Quick start (deploy in ~10 minutes)

You only need to: **create a Supabase project → copy 3 values → set 5 env
vars → deploy.** No manual table creation.

### 1. Create a Supabase project
- Go to <https://supabase.com> → New project.
- Once ready, open **Settings → API** and copy:
  - **Project URL** → `SUPABASE_URL`
  - **anon public** key → `SUPABASE_ANON_KEY`
  - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Create the database schema (one command — no manual SQL)
From the project root, set your DB password (Settings → Database → Database
password) and run:

```bash
npm install
SUPABASE_URL="https://YOUR-REF.supabase.co" \
SUPABASE_DB_PASSWORD="your-db-password" \
npm run db:migrate
```

This applies everything in `supabase/migrations/` (idempotent — safe to
re-run). Prefer the dashboard? Just paste the contents of
`supabase/migrations/0001_init.sql` then `0002_functions.sql` into the
Supabase **SQL Editor** and run them.

### 3. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOU/anime-stream.git
git push -u origin main
```

### 4. Connect Cloudflare Pages
- Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
- Pick the repo. Set the build config:
  - **Build command:** `npx @cloudflare/next-on-pages`
  - **Build output directory:** `.vercel/output/static`
- Under **Settings → Environment variables**, add the variables below.
- Under **Settings → Functions → Compatibility flags**, add `nodejs_compat`.
- Deploy. Every future `git push` auto-deploys.

### 5. Environment variables (set in Cloudflare Pages)

| Variable                    | Required | Description                                  |
| --------------------------- | -------- | -------------------------------------------- |
| `SUPABASE_URL`              | ✅       | Supabase project URL                         |
| `SUPABASE_ANON_KEY`         | ✅       | Supabase anon public key                     |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅       | Supabase service role secret                 |
| `ADMIN_EMAIL`               | ✅       | Admin login email                            |
| `ADMIN_PASSWORD`            | ✅       | Admin login password                         |
| `AUTH_SECRET`               | ➕       | Long random string to sign sessions (set it) |
| `NEXT_PUBLIC_SITE_URL`      | ➕       | Your public URL (for SEO/sitemap/OG)         |

Admin credentials live **only** in env vars — never in the database.

---

## Local development

```bash
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # http://localhost:3000
```

Preview the actual Cloudflare build locally:

```bash
npm run preview              # next-on-pages build + wrangler pages dev
```

---

## Project structure

```
src/
├── app/
│   ├── (site)/              # public site (shares navbar/footer layout)
│   │   ├── page.tsx         # home
│   │   └── anime/[slug]/    # details page
│   ├── admin/               # protected dashboard
│   │   ├── login/           # only unprotected admin route
│   │   ├── anime/           # list / new / [id] manage
│   │   └── analytics/       # click analytics
│   ├── api/
│   │   ├── admin/           # protected CRUD (anime, episodes, auth)
│   │   ├── search/          # public instant search
│   │   └── track/           # public click tracking
│   ├── sitemap.ts / robots.ts
│   └── layout.tsx
├── components/  (ui / site / anime / admin)
├── features/                # feature-scoped composition
├── hooks/  lib/  services/  types/  styles/
├── middleware.ts            # protects /admin and /api/admin
supabase/migrations/         # auto-applied SQL schema
scripts/migrate.mjs          # migration runner
```

---

## Security
- `/admin` and `/api/admin/*` protected by edge middleware (signed httpOnly,
  Secure, SameSite cookie). Constant-time credential & signature comparison.
- Service-role key only ever used server-side, behind the auth gate.
- Zod validation + input sanitization (XSS-blunting, URL allow-listing) on
  every write. Parameterized Supabase queries (no SQL injection).
- Best-effort per-IP rate limiting on login, search, and tracking.
- RLS enabled: anon can only read content and record clicks.

---

## Notes / upgrade path
- Pinned to **Next 15.5.2** because `@cloudflare/next-on-pages` currently
  supports Next ≤ 15.5.2. To move to newer Next, migrate to the
  [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare).
- See `DEPLOYMENT.md` for the detailed step-by-step deploy guide.
