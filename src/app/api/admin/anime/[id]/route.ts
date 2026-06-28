import type { NextRequest } from "next/server";
import { updateAnime, deleteAnime } from "@/services/anime.service";
import { animeSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/utils";

export const runtime = "edge";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const anime = await updateAnime(id, {
    title: sanitizeText(v.title, 200),
    description: sanitizeText(v.description, 5000),
    poster_url: v.poster_url,
    banner_url: v.banner_url ?? null,
    is_featured: v.is_featured,
    is_trending: v.is_trending,
  });

  return Response.json({ ok: true, data: anime });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteAnime(id);
  return Response.json({ ok: true });
}
