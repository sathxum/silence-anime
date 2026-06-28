# 🎌 Silence Anime — Premium Anime Streaming Platform

A production-ready anime streaming website with a luxurious UI, a full admin
dashboard, popup notifications, disclaimers, and per-link click analytics.
Built to run on **Cloudflare Pages** (free tier friendly) with a **Supabase**
(free tier) database.

> **How "streaming" works here:** episode **Play** buttons **redirect** to the
> external links you paste in (Streamtape, Filemoon, your Telegram, anything).
> The video player is **never embedded** — clean, simple, and exactly as
> requested.

Built with ❤️ by **[@sinket-X (sahu)](https://github.com/sinket-X)**

---

## ✨ Features

### Public site
- **Cinematic hero banner** with auto-rotating featured anime
- **Trending / Latest / Recently Added** sliders + full searchable grid
- **Instant search** (debounced, with poster thumbnails)
- **Anime detail pages** with episode lists, auto **"Hindi Dub"** badges
- **Play button → redirect** (records a click, then sends the visitor to your link)
- **Popup notifications** shown one-by-one on site open (see below)
- **Disclaimers** in the footer and at the end of each anime page
- **Two premium themes**: dark (default) + silver/white, with a toggle
- Fully **responsive**, SEO-optimized (sitemap, robots, Open Graph, JSON-LD)

### 🔔 Popup notifications (admin-controlled)
- Admin creates popups with a **title, body, optional image, and a link**
  (e.g. an admin/Telegram link, announcement, etc.)
- On site open, popups appear **one at a time**, centered, with a premium UI
- Each popup has a **close button that unlocks after a delay** the admin sets
  (**1–10 seconds**, shown as a live circular countdown). The default is 4s.
- Closing one popup advances to the **next**, then the next — for as many as
  the admin has created
- Toggle each popup **active/inactive** without deleting it

### 📜 Disclaimers (admin-controlled)
- Add disclaimers shown **site-wide** (footer) or **at the end of every anime page**
- Optional heading + body, toggle active/inactive

### 🛠 Admin dashboard (`/admin`)
- Single login gated by **environment-variable credentials** (no public signup)
- **Add / edit / delete anime** with live poster & banner preview
- **Manage episodes** with drag-and-drop reordering
- **Notifications** and **Disclaimers** managers
- **Analytics**: total clicks, clicks per anime, and **clicks per episode link**

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict, zero `any`) |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (Postgres) |
| Hosting | Cloudflare Pages (edge runtime) |
| Auth | Signed HMAC session cookie (Web Crypto) |

---

## 🚀 Quick start

> Full, click-by-click instructions are in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
> Short version below.

### 1. Set up the database (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the entire contents of
   [`supabase/setup.sql`](./supabase/setup.sql), and click **Run**.
   *(Optional: also run [`supabase/seed.sql`](./supabase/seed.sql) for sample anime.)*
3. From **Settings → API**, copy your **Project URL**, **anon key**, and
   **service_role key**.

### 2. Deploy to Cloudflare Pages
1. Push this repo to GitHub (already done if you're reading this there).
2. In [Cloudflare Pages](https://pages.cloudflare.com) → **Create → Pages →
   Connect to Git**, pick this repo.
3. Build settings:
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
4. Add the **environment variables** below (Settings → Environment variables).
5. Set the compatibility flag **`nodejs_compat`** (Settings → Functions →
   Compatibility flags, for both Production and Preview).
6. Deploy. Done. 🎉

### 3. Log in to admin
Go to `https://your-site.pages.dev/admin`, log in with the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` you set, and start adding anime, popups, and disclaimers.

---

## 🔐 Environment variables

| Variable | Required | What it is |
|---|---|---|
| `SUPABASE_URL` | ✅ | Project URL from Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | ✅ | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service_role secret key |
| `ADMIN_EMAIL` | ✅ | The email you log into `/admin` with |
| `ADMIN_PASSWORD` | ✅ | The password you log into `/admin` with |
| `AUTH_SECRET` | ⭐ recommended | Any long random string (signs the admin session) |
| `NEXT_PUBLIC_SITE_URL` | ⭐ recommended | Your final site URL (for SEO / sitemap) |

See [`.env.example`](./.env.example) for a copy-paste template.

---

## 💻 Local development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase + admin values
npm run dev                  # http://localhost:3000
```

Useful commands:
```bash
npm run typecheck     # TypeScript check (no errors = good)
npm run pages:build   # the real Cloudflare build (verify before deploying)
npm run db:migrate    # apply migrations via Postgres (needs SUPABASE_DB_PASSWORD)
```

---

## 📁 Project structure

```
src/
  app/
    (site)/        public pages (home, anime detail) + popups & disclaimers
    admin/         dashboard (anime, episodes, notifications, disclaimers, analytics)
    api/           edge route handlers (admin CRUD, search, click tracking, popups)
  components/      UI primitives + site/admin/anime components
  services/        server-only data access (anime, stats, content)
  lib/             env, auth, supabase, validation, utils
  types/           shared TypeScript types (single source of truth)
supabase/
  migrations/      versioned SQL
  setup.sql        all migrations combined (paste into Supabase SQL Editor)
  seed.sql         optional sample data
```

---

## 📝 Notes

- **Pinned to Next 15.5.2** because `@cloudflare/next-on-pages` supports up to
  that version. If you later want a newer Next, migrate to the
  [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare).
- This is an **open-source** project — no GitHub Actions/CI is included on
  purpose. Cloudflare Pages builds and deploys directly from your repo.

---

## 📄 License

MIT — free to use, modify, and share.

Built by **[@sinket-X (sahu)](https://github.com/sinket-X)**.
