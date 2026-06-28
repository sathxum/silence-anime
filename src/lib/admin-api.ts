import type { Anime, Episode, ApiResult, Popup, Disclaimer } from "@/types";
import type {
  AnimeFormValues,
  EpisodeFormValues,
  PopupFormValues,
  DisclaimerFormValues,
} from "@/lib/validation";

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

  // Popups (notifications)
  listPopups: () => request<Popup[]>("/api/admin/popups"),
  createPopup: (data: PopupFormValues) =>
    request<Popup>("/api/admin/popups", { method: "POST", body: JSON.stringify(data) }),
  updatePopup: (id: string, data: PopupFormValues) =>
    request<Popup>(`/api/admin/popups/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePopup: (id: string) =>
    request<{ id: string }>(`/api/admin/popups/${id}`, { method: "DELETE" }),

  // Disclaimers
  listDisclaimers: () => request<Disclaimer[]>("/api/admin/disclaimers"),
  createDisclaimer: (data: DisclaimerFormValues) =>
    request<Disclaimer>("/api/admin/disclaimers", { method: "POST", body: JSON.stringify(data) }),
  updateDisclaimer: (id: string, data: DisclaimerFormValues) =>
    request<Disclaimer>(`/api/admin/disclaimers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDisclaimer: (id: string) =>
    request<{ id: string }>(`/api/admin/disclaimers/${id}`, { method: "DELETE" }),
};
