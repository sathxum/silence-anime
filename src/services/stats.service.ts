import "server-only";
import { createServiceSupabase } from "@/lib/supabase";
import type { DashboardStats, AnimeClickStat, EpisodeClickStat } from "@/types";

/**
 * Analytics: aggregates episode-link click data for the admin dashboard.
 * Clicks are recorded in the `episode_clicks` table (one row per click) and
 * a denormalized counter on `episodes.click_count` for fast reads.
 */

export async function recordEpisodeClick(episodeId: string): Promise<number> {
  const db = createServiceSupabase();
  const { data, error } = await db.rpc("record_episode_click", {
    p_episode_id: episodeId,
  });
  if (error) throw new Error(error.message);
  return typeof data === "number" ? data : 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const db = createServiceSupabase();

    const [{ count: animeCount }, { count: episodeCount }, { count: clickCount }] = await Promise.all([
      db.from("anime").select("*", { count: "exact", head: true }),
      db.from("episodes").select("*", { count: "exact", head: true }),
      db.from("episode_clicks").select("*", { count: "exact", head: true }),
    ]);

    const { data: recent } = await db
      .from("anime")
      .select("id, slug, title, poster_url, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      totalAnime: animeCount ?? 0,
      totalEpisodes: episodeCount ?? 0,
      totalClicks: clickCount ?? 0,
      recentAnime: recent ?? [],
    };
  } catch {
    return { totalAnime: 0, totalEpisodes: 0, totalClicks: 0, recentAnime: [] };
  }
}

/** Per-anime click totals (sum of all its episode clicks), most-clicked first. */
export async function getAnimeClickStats(): Promise<AnimeClickStat[]> {
  try {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("anime")
      .select("id, title, slug, poster_url, episodes(click_count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const stats: AnimeClickStat[] = (data ?? []).map((row) => {
      const episodes = (row.episodes ?? []) as Array<{ click_count: number }>;
      const totalClicks = episodes.reduce((sum, e) => sum + (e.click_count ?? 0), 0);
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        poster_url: row.poster_url,
        episodeCount: episodes.length,
        totalClicks,
      };
    });

    return stats.sort((a, b) => b.totalClicks - a.totalClicks);
  } catch {
    return [];
  }
}

/** Per-episode (per-link) click breakdown for one anime, most-clicked first. */
export async function getEpisodeClickStats(animeId: string): Promise<EpisodeClickStat[]> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("episodes")
    .select("id, episode_number, name, redirect_url, click_count, position")
    .eq("anime_id", animeId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((e) => ({
    id: e.id,
    episodeNumber: e.episode_number,
    name: e.name,
    redirectUrl: e.redirect_url,
    clickCount: e.click_count ?? 0,
  }));
}
