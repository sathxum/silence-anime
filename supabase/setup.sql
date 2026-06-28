-- ============================================================================
-- Silence Anime — Complete database setup (paste into Supabase SQL Editor, Run)
-- Combines all migrations. Idempotent — safe to run more than once.
-- Built by @sinket-X (sahu)
-- ============================================================================

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


-- ============================================================================
-- Anime Stream — RPC helpers (0002)
-- ============================================================================

-- Atomic click recording. Inserts a click row, bumps the denormalized
-- counter on the episode, and returns the new total. Runs as definer so the
-- anon role can record clicks without direct table write access.
create or replace function public.record_episode_click(p_episode_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anime_id uuid;
  v_total    bigint;
begin
  select anime_id into v_anime_id from public.episodes where id = p_episode_id;
  if v_anime_id is null then
    raise exception 'episode not found';
  end if;

  insert into public.episode_clicks (episode_id, anime_id)
  values (p_episode_id, v_anime_id);

  update public.episodes
     set click_count = click_count + 1
   where id = p_episode_id
  returning click_count into v_total;

  return v_total;
end;
$$;

grant execute on function public.record_episode_click(uuid) to anon, authenticated;

-- Case-insensitive partial search over title + description, prefix matches
-- ranked first.
create or replace function public.search_anime(p_query text, p_limit int default 24)
returns setof public.anime
language sql
stable
as $$
  select *
  from public.anime
  where p_query is null
     or p_query = ''
     or title ilike '%' || p_query || '%'
     or description ilike '%' || p_query || '%'
  order by
    case when title ilike p_query || '%' then 0 else 1 end,
    created_at desc
  limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.search_anime(text, int) to anon, authenticated;


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
