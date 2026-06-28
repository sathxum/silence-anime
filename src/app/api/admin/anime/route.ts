import type { NextRequest } from "next/server";
import { createAnime, getAllAnime } from "@/services/anime.service";
import { animeSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/utils";

export const runtime = "edge";

export async function GET() {
  const anime = await getAllAnime();
  return Response.json({ ok: true, data: anime });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = animeSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }

  const v = parsed.data;
  const anime = await createAnime({
    title: sanitizeText(v.title, 200),
    description: sanitizeText(v.description, 5000),
    poster_url: v.poster_url,
    banner_url: v.banner_url ?? null,
    is_featured: v.is_featured,
    is_trending: v.is_trending,
  });

  return Response.json({ ok: true, data: anime }, { status: 201 });
}
