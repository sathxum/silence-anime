import type { NextRequest } from "next/server";
import { recordEpisodeClick } from "@/services/stats.service";

export const runtime = "edge";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records a click on an episode's play button. Designed to be cheap and
 * fire-and-forget: the client uses navigator.sendBeacon and redirects
 * immediately, so we never block playback. Accepts both `episode_id` and
 * `episodeId` for robustness. Always returns 200 so beacons never surface
 * errors to the user.
 */
export async function POST(req: NextRequest) {
  let episodeId = "";
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const raw = body.episode_id ?? body.episodeId;
    if (typeof raw === "string") episodeId = raw;
  } catch {
    /* ignore — return ok below */
  }

  if (!UUID_RE.test(episodeId)) {
    return Response.json({ ok: true });
  }

  // Fire the DB write but never let it block or fail the response.
  try {
    await recordEpisodeClick(episodeId);
  } catch {
    /* swallow — analytics must never break the redirect */
  }
  return Response.json({ ok: true });
}
