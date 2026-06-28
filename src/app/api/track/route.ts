import type { NextRequest } from "next/server";
import { recordEpisodeClick } from "@/services/stats.service";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "edge";

/**
 * Records a click on an episode's play button, then returns the redirect URL
 * resolution to the caller. The browser navigates to the external link; we
 * only count the click here.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(`track:${ip}`, 120, 60_000);
  if (!limit.ok) {
    return Response.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  let body: { episodeId?: unknown };
  try {
    body = (await req.json()) as { episodeId?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const episodeId = typeof body.episodeId === "string" ? body.episodeId : "";
  // UUID shape check to avoid junk hitting the DB.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(episodeId)) {
    return Response.json({ ok: false, error: "Invalid episode id" }, { status: 400 });
  }

  try {
    const total = await recordEpisodeClick(episodeId);
    return Response.json({ ok: true, data: { total } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tracking failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
