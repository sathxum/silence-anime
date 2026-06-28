/**
 * Database row & domain types. Mirrors the SQL schema in
 * supabase/migrations. No `any` anywhere — these are the single source of
 * truth for shapes flowing through the app.
 */

export interface Anime {
  id: string;
  slug: string;
  title: string;
  description: string;
  poster_url: string;
  banner_url: string | null;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  anime_id: string;
  /** Sequential number used for display, e.g. 1, 2, 3. */
  episode_number: number;
  /** Display name, e.g. "Episode 1". */
  name: string;
  /** Optional episode title, e.g. "The Beginning". */
  title: string | null;
  /** External link the play button redirects to. */
  redirect_url: string;
  /** Whether the "Hindi Dub" badge shows. Defaults true. */
  is_hindi_dub: boolean;
  /** Manual ordering position for drag-and-drop (1-based). */
  position: number;
  /** Denormalized click counter for fast reads. */
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface AnimeWithEpisodes extends Anime {
  episodes: Episode[];
}

/** Episodes always carry a denormalized click_count; alias for clarity. */
export type EpisodeWithClicks = Episode;

export interface AnimeWithStats extends Anime {
  episodeCount: number;
  totalClicks: number;
}

/** Payloads for admin write operations. */
export interface AnimeInput {
  title: string;
  description: string;
  poster_url: string;
  banner_url?: string | null;
  is_featured?: boolean;
  is_trending?: boolean;
}

export interface EpisodeInput {
  episode_number: number;
  name: string;
  title?: string | null;
  redirect_url: string;
  is_hindi_dub?: boolean;
}

// ---------- Dashboard / analytics ------------------------------------------

export interface RecentAnime {
  id: string;
  slug: string;
  title: string;
  poster_url: string;
  created_at: string;
}

export interface DashboardStats {
  totalAnime: number;
  totalEpisodes: number;
  totalClicks: number;
  recentAnime: RecentAnime[];
}

export interface AnimeClickStat {
  id: string;
  title: string;
  slug: string;
  poster_url: string;
  episodeCount: number;
  totalClicks: number;
}

export interface EpisodeClickStat {
  id: string;
  episodeNumber: number;
  name: string;
  redirectUrl: string;
  clickCount: number;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
