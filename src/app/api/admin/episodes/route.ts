import type { NextRequest } from "next/server";
import { createEpisode, getEpisodesForAnime } from "@/services/anime.service";
import { episodeSchema } from "@/lib/validation";
import { sanitizeText, sanitizeUrl } from "@/lib/utils";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const animeId = req.nextUrl.searchParams.get("anime_id");
  if (!animeId) {
    return Response.json({ ok: false, error: "anime_id is required" }, { status: 400 });
  }
  const episodes = await getEpisodesForAnime(animeId);
  return Response.json({ ok: true, data: episodes });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = episodeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }

  const v = parsed.data;
  const url = sanitizeUrl(v.redirect_url);
  if (!url) {
    return Response.json({ ok: false, error: "Redirect link must be a valid URL" }, { status: 422 });
  }

  const episode = await createEpisode(v.anime_id, {
    episode_number: v.episode_number,
    name: sanitizeText(v.name, 200),
    title: sanitizeText(v.title ?? "", 200),
    redirect_url: url,
    is_hindi_dub: true,
  });

  return Response.json({ ok: true, data: episode }, { status: 201 });
}
