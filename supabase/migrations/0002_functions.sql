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
