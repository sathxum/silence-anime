import type { NextRequest } from "next/server";
import { reorderEpisodes } from "@/services/anime.service";
import { reorderSchema } from "@/lib/validation";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }
  await reorderEpisodes(parsed.data.anime_id, parsed.data.ordered_ids);
  return Response.json({ ok: true });
}
