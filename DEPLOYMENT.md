# Deployment Guide — Silence Anime

End-to-end, click-by-click. Total time ~10–15 minutes.

---

## Part 1 — Supabase (database)

1. Go to <https://supabase.com> and sign in. Click **New project**.
2. Name it (e.g. `anime-stream`), choose a region close to your users, set a
   strong **database password** (save it — you need it for migrations).
3. Wait for provisioning (~2 min).
4. Open **Settings → API** and copy three values:
   - **Project URL** → this is `SUPABASE_URL`
   - **Project API keys → anon public** → `SUPABASE_ANON_KEY`
   - **Project API keys → service_role** → `SUPABASE_SERVICE_ROLE_KEY`
     (keep this secret — it bypasses row-level security)

### Create the schema

**Option A — one command (recommended):**
```bash
npm install
SUPABASE_URL="https://YOUR-REF.supabase.co" \
SUPABASE_DB_PASSWORD="your-db-password" \
npm run db:migrate
```

**Option B — dashboard SQL editor:**
Open **SQL Editor → New query**, paste the full contents of
`supabase/migrations/0001_init.sql`, run it, then do the same for
`0002_functions.sql`. Both are idempotent (safe to re-run).

This creates the `anime`, `episodes`, and `episode_clicks` tables, indexes,
the `record_episode_click` / `search_anime` functions, and RLS policies.

---

## Part 2 — GitHub

```bash
cd anime-stream
git init
git add .
git commit -m "Initial commit: Silence Anime anime streaming platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/anime-stream.git
git push -u origin main
```

---

## Part 3 — Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and select your `anime-stream` repo.
3. **Build settings:**
   - Framework preset: **None** (we use next-on-pages directly)
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
4. **Environment variables** (Settings → Environment variables → Production,
   and also add to Preview if you want preview deploys to work):

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | your project URL |
   | `SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key |
   | `ADMIN_EMAIL` | your admin email |
   | `ADMIN_PASSWORD` | a strong password |
   | `AUTH_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
   | `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. `https://anime-stream.pages.dev` |

5. **Compatibility flag:** Settings → Functions → **Compatibility flags** →
   add `nodejs_compat` for both Production and Preview.
6. Click **Save and Deploy**.

Every push to `main` now auto-deploys. Pull requests get preview deploys.

> If your first deploy ran before you added the env vars / compat flag, open
> the latest deployment and click **Retry deployment** after saving them.

---

## Part 4 — Verify

1. Visit your `*.pages.dev` URL → the home page loads (empty until you add
   anime — that's expected).
2. Go to `/admin` → you're redirected to `/admin/login`.
3. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. **Add Anime** → fill title, description, poster URL (watch the live
   preview) → Save.
5. Open the anime → **Episodes** tab → add an episode with a redirect link.
   Drag to reorder. The "Hindi Dub" badge appears automatically.
6. Back on the public site, open the anime, click an episode's play button →
   it redirects to your link, and the click is recorded.
7. In **Admin → Analytics** (and the anime's **Link Analytics** tab) you can
   see per-anime and per-link click counts.

---

## Custom domain
Cloudflare Pages → your project → **Custom domains → Set up a domain**.
Then update `NEXT_PUBLIC_SITE_URL` to the custom domain and redeploy so SEO
metadata, sitemap, and OG tags use the right host.

---

## Optional: GitHub Actions deploy
A workflow is included at `.github/workflows/deploy.yml`. You don't need it if
you used the Cloudflare Git integration above (that already auto-deploys). To
use Actions instead, add repo secrets `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_ACCOUNT_ID`, and the app env vars.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| 500 on every page | Env vars missing/typo'd in Cloudflare. Re-check, redeploy. |
| Build fails on `nodejs_compat` | Add the `nodejs_compat` compatibility flag. |
| Login always fails | `ADMIN_EMAIL`/`ADMIN_PASSWORD` mismatch; emails are compared case-insensitively. |
| Data not showing | Migrations didn't run. Re-run Part 1, or paste SQL in the editor. |
| Posters not loading | Poster URL must be a valid public `https://` image URL. |
| Want newer Next.js | Migrate to the OpenNext Cloudflare adapter (next-on-pages caps at 15.5.2). |
