-- ============================================================================
-- Anime Stream — Initial schema (0001)
-- Idempotent: safe to run multiple times. Creates all required tables,
-- indexes, triggers and RLS policies if they do not already exist.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Helper: updated_at trigger function ----------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- anime
-- ============================================================================
create table if not exists public.anime (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text not null default '',
  poster_url  text not null default '',
  banner_url  text,
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists anime_created_at_idx on public.anime (created_at desc);
create index if not exists anime_featured_idx    on public.anime (is_featured) where is_featured = true;
create index if not exists anime_trending_idx    on public.anime (is_trending) where is_trending = true;
create index if not exists anime_title_trgm_idx  on public.anime using gin (to_tsvector('simple', title));

drop trigger if exists anime_set_updated_at on public.anime;
create trigger anime_set_updated_at
  before update on public.anime
  for each row execute function public.set_updated_at();

-- ============================================================================
-- episodes
-- ============================================================================
create table if not exists public.episodes (
  id             uuid primary key default gen_random_uuid(),
  anime_id       uuid not null references public.anime(id) on delete cascade,
  episode_number integer not null,
  name           text not null default '',
  title          text not null default '',
  redirect_url   text not null,
  is_hindi_dub   boolean not null default true,
  position       integer not null default 0,
  -- denormalized click counter for fast dashboard reads; kept in sync by
  -- the record_episode_click() RPC.
  click_count    bigint not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (anime_id, episode_number)
);

create index if not exists episodes_anime_idx    on public.episodes (anime_id);
create index if not exists episodes_position_idx on public.episodes (anime_id, position asc);

drop trigger if exists episodes_set_updated_at on public.episodes;
create trigger episodes_set_updated_at
  before update on public.episodes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- episode_clicks — one row per click (full audit trail for analytics)
-- ============================================================================
create table if not exists public.episode_clicks (
  id          uuid primary key default gen_random_uuid(),
  episode_id  uuid not null references public.episodes(id) on delete cascade,
  anime_id    uuid not null references public.anime(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists episode_clicks_episode_idx on public.episode_clicks (episode_id);
create index if not exists episode_clicks_anime_idx   on public.episode_clicks (anime_id);
create index if not exists episode_clicks_created_idx on public.episode_clicks (created_at desc);

-- ============================================================================
-- Row Level Security
-- Public (anon) may READ anime + episodes. All writes go through the
-- service-role key (server-side admin API), which bypasses RLS. Click
-- recording is funnelled through a SECURITY DEFINER function (0002).
-- ============================================================================
alter table public.anime          enable row level security;
alter table public.episodes       enable row level security;
alter table public.episode_clicks enable row level security;

drop policy if exists "anime public read" on public.anime;
create policy "anime public read"
  on public.anime for select
  to anon, authenticated
  using (true);

drop policy if exists "episodes public read" on public.episodes;
create policy "episodes public read"
  on public.episodes for select
  to anon, authenticated
  using (true);

-- No direct anon access to episode_clicks; recording happens via RPC only.
