import "server-only";
import { createServiceSupabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import type {
  Anime,
  AnimeWithEpisodes,
  Episode,
  EpisodeInput,
  AnimeInput,
} from "@/types";

/**
 * Server-side data access for anime & episodes. Uses the service-role client
 * (RLS-bypassing) and is only ever imported from server components / route
 * handlers — guarded by `server-only`.
 */

const HINDI_DUB_BADGE = "Hindi Dub";

/** Run a read and swallow errors into a fallback, so a transient DB issue
 *  degrades gracefully on public pages instead of throwing a 500. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ---------- Public reads ----------------------------------------------------

export async function getFeaturedAnime(limit = 8): Promise<Anime[]> {
  return safe(async () => {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("anime")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []);
}

export async function getTrendingAnime(limit = 12): Promise<Anime[]> {
  return safe(async () => {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("anime")
      .select("*")
      .eq("is_trending", true)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []);
}

export async function getLatestAnime(limit = 12): Promise<Anime[]> {
  return safe(async () => {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("anime")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []);
}

export async function getAllAnime(): Promise<Anime[]> {
  return safe(async () => {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("anime")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []);
}

export async function getAnimeBySlug(slug: string): Promise<AnimeWithEpisodes | null> {
  const db = createServiceSupabase();
  const { data: anime, error } = await db
    .from("anime")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!anime) return null;

  const { data: episodes, error: epError } = await db
    .from("episodes")
    .select("*")
    .eq("anime_id", anime.id)
    .order("position", { ascending: true });
  if (epError) throw new Error(epError.message);

  return { ...anime, episodes: episodes ?? [] };
}

export async function searchAnime(query: string, limit = 20): Promise<Anime[]> {
  const q = query.trim();
  if (!q) return [];
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("anime")
    .select("*")
    .ilike("title", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ---------- Admin writes ----------------------------------------------------

async function uniqueSlug(db: ReturnType<typeof createServiceSupabase>, title: string, ignoreId?: string): Promise<string> {
  const base = slugify(title) || "anime";
  let candidate = base;
  let n = 1;
  // Loop until we find a slug not taken by another row.
  for (;;) {
    const { data, error } = await db
      .from("anime")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data || data.id === ignoreId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

export async function createAnime(input: AnimeInput): Promise<Anime> {
  const db = createServiceSupabase();
  const slug = await uniqueSlug(db, input.title);
  const { data, error } = await db
    .from("anime")
    .insert({
      slug,
      title: input.title,
      description: input.description,
      poster_url: input.poster_url,
      banner_url: input.banner_url ?? null,
      is_featured: input.is_featured ?? false,
      is_trending: input.is_trending ?? false,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAnime(id: string, input: AnimeInput): Promise<Anime> {
  const db = createServiceSupabase();
  const slug = await uniqueSlug(db, input.title, id);
  const { data, error } = await db
    .from("anime")
    .update({
      slug,
      title: input.title,
      description: input.description,
      poster_url: input.poster_url,
      banner_url: input.banner_url ?? null,
      is_featured: input.is_featured ?? false,
      is_trending: input.is_trending ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAnime(id: string): Promise<void> {
  const db = createServiceSupabase();
  const { error } = await db.from("anime").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Episodes --------------------------------------------------------

export async function getEpisodesForAnime(animeId: string): Promise<Episode[]> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("episodes")
    .select("*")
    .eq("anime_id", animeId)
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  const db = createServiceSupabase();
  const { data, error } = await db.from("anime").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function createEpisode(animeId: string, input: EpisodeInput): Promise<Episode> {
  const db = createServiceSupabase();
  // Next position = current max + 1
  const { data: maxRow } = await db
    .from("episodes")
    .select("position")
    .eq("anime_id", animeId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (maxRow?.position ?? 0) + 1;

  const { data, error } = await db
    .from("episodes")
    .insert({
      anime_id: animeId,
      episode_number: input.episode_number,
      name: input.name,
      title: input.title ?? null,
      redirect_url: input.redirect_url,
      is_hindi_dub: input.is_hindi_dub ?? true,
      position: nextPosition,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateEpisode(id: string, input: EpisodeInput): Promise<Episode> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("episodes")
    .update({
      episode_number: input.episode_number,
      name: input.name,
      title: input.title ?? null,
      redirect_url: input.redirect_url,
      is_hindi_dub: input.is_hindi_dub ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEpisode(id: string): Promise<void> {
  const db = createServiceSupabase();
  const { error } = await db.from("episodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Persist a new ordering. `orderedIds` is the full list of episode ids in the desired order. */
export async function reorderEpisodes(animeId: string, orderedIds: string[]): Promise<void> {
  const db = createServiceSupabase();
  // Update positions sequentially; small lists so this is fine.
  await Promise.all(
    orderedIds.map((id, index) =>
      db.from("episodes").update({ position: index + 1 }).eq("id", id).eq("anime_id", animeId),
    ),
  );
}

export { HINDI_DUB_BADGE };
