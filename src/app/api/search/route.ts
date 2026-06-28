import type { NextRequest } from "next/server";
import { searchAnime } from "@/services/anime.service";
import { sanitizeText } from "@/lib/utils";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimit(`search:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return Response.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const q = sanitizeText(req.nextUrl.searchParams.get("q") ?? "", 100);
  if (q.length < 1) {
    return Response.json({ ok: true, data: [] });
  }

  try {
    const results = await searchAnime(q, 20);
    return Response.json(
      { ok: true, data: results },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
