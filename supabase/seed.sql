-- ============================================================================
-- Silence Anime — Optional sample data
-- Run AFTER setup.sql if you want a populated catalogue to preview the UI.
-- Safe to skip entirely. Uses public poster images.
-- ============================================================================

insert into public.anime (slug, title, description, poster_url, banner_url, is_featured, is_trending)
values
  ('demon-slayer', 'Demon Slayer', 'A young boy becomes a demon slayer to avenge his family and cure his sister.', 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg', 'https://image.tmdb.org/t/p/original/nTvM4mhqNlHIvUkI1gVnW6XP7GG.jpg', true, true),
  ('jujutsu-kaisen', 'Jujutsu Kaisen', 'A student joins a secret organization of sorcerers to kill a powerful curse.', 'https://image.tmdb.org/t/p/w500/fHpKWq9ayzSk8nSwqRuLnJYR8eb.jpg', 'https://image.tmdb.org/t/p/original/wEYmHJrXFwLg6yGqhWzgL8B7T4U.jpg', true, true),
  ('attack-on-titan', 'Attack on Titan', 'Humanity fights for survival against man-eating giants behind enormous walls.', 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg', 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', false, true)
on conflict (slug) do nothing;

-- Episodes for Demon Slayer
insert into public.episodes (anime_id, episode_number, name, title, redirect_url, position, is_hindi_dub)
select a.id, 1, 'Episode 1', 'Cruelty', 'https://example.com/watch/demon-slayer-1', 1, true
from public.anime a where a.slug = 'demon-slayer'
on conflict (anime_id, episode_number) do nothing;

insert into public.episodes (anime_id, episode_number, name, title, redirect_url, position, is_hindi_dub)
select a.id, 2, 'Episode 2', 'Trainer Sakonji Urokodaki', 'https://example.com/watch/demon-slayer-2', 2, true
from public.anime a where a.slug = 'demon-slayer'
on conflict (anime_id, episode_number) do nothing;

insert into public.episodes (anime_id, episode_number, name, title, redirect_url, position, is_hindi_dub)
select a.id, 1, 'Episode 1', 'Ryomen Sukuna', 'https://example.com/watch/jjk-1', 1, true
from public.anime a where a.slug = 'jujutsu-kaisen'
on conflict (anime_id, episode_number) do nothing;
