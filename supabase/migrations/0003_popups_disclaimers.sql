-- ============================================================================
-- Silence Anime — Popups (notifications) & Disclaimers (0003)
-- Idempotent: safe to run multiple times.
-- ============================================================================

-- ============================================================================
-- popups — admin-authored notifications shown when a visitor opens the site.
-- They display one-by-one; a close button appears after `dismiss_after_seconds`
-- (admin-configurable, capped 1–10s in the app), then the next popup shows.
-- ============================================================================
create table if not exists public.popups (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null default '',
  body                 text not null default '',
  image_url            text,
  -- Optional call-to-action ("admin link").
  link_url             text,
  link_label           text not null default 'Learn more',
  -- Seconds before the close button appears (1..10).
  dismiss_after_seconds integer not null default 4
    check (dismiss_after_seconds between 1 and 10),
  is_active            boolean not null default true,
  position             integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists popups_active_idx   on public.popups (is_active) where is_active = true;
create index if not exists popups_position_idx on public.popups (position asc);

drop trigger if exists popups_set_updated_at on public.popups;
create trigger popups_set_updated_at
  before update on public.popups
  for each row execute function public.set_updated_at();

-- ============================================================================
-- disclaimers — admin-authored notices.
-- placement = 'site'  -> shown site-wide (footer area)
-- placement = 'anime' -> shown at the end of every anime detail page
-- ============================================================================
create table if not exists public.disclaimers (
  id          uuid primary key default gen_random_uuid(),
  placement   text not null default 'site' check (placement in ('site', 'anime')),
  title       text not null default '',
  body        text not null default '',
  is_active   boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists disclaimers_placement_idx on public.disclaimers (placement, is_active);

drop trigger if exists disclaimers_set_updated_at on public.disclaimers;
create trigger disclaimers_set_updated_at
  before update on public.disclaimers
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS — public may read active rows; all writes go through the service role.
-- ============================================================================
alter table public.popups       enable row level security;
alter table public.disclaimers  enable row level security;

drop policy if exists "popups public read" on public.popups;
create policy "popups public read"
  on public.popups for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "disclaimers public read" on public.disclaimers;
create policy "disclaimers public read"
  on public.disclaimers for select
  to anon, authenticated
  using (is_active = true);
