import type { Anime, Episode, ApiResult } from "@/types";
import type { AnimeFormValues, EpisodeFormValues } from "@/lib/validation";

/**
 * Thin client for the admin API. All admin endpoints are protected by
 * middleware (httpOnly session cookie), so credentials ride along
 * automatically with same-origin fetches.
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!res.ok || !json.ok) {
    throw new Error(("error" in json && json.error) || `Request failed (${res.status})`);
  }
  return json.data;
}

export const adminApi = {
  // Anime
  listAnime: () => request<Anime[]>("/api/admin/anime"),
  createAnime: (data: AnimeFormValues) =>
    request<Anime>("/api/admin/anime", { method: "POST", body: JSON.stringify(data) }),
  updateAnime: (id: string, data: AnimeFormValues) =>
    request<Anime>(`/api/admin/anime/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAnime: (id: string) =>
    request<{ id: string }>(`/api/admin/anime/${id}`, { method: "DELETE" }),

  // Episodes
  listEpisodes: (animeId: string) =>
    request<Episode[]>(`/api/admin/episodes?anime_id=${encodeURIComponent(animeId)}`),
  createEpisode: (data: EpisodeFormValues) =>
    request<Episode>("/api/admin/episodes", { method: "POST", body: JSON.stringify(data) }),
  updateEpisode: (id: string, data: EpisodeFormValues) =>
    request<Episode>(`/api/admin/episodes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEpisode: (id: string) =>
    request<{ id: string }>(`/api/admin/episodes/${id}`, { method: "DELETE" }),
  reorderEpisodes: (animeId: string, orderedIds: string[]) =>
    request<{ ok: true }>("/api/admin/episodes/reorder", {
      method: "POST",
      body: JSON.stringify({ anime_id: animeId, ordered_ids: orderedIds }),
    }),
};
