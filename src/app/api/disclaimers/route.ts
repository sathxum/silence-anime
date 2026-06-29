import { getDisclaimersByPlacement } from "@/services/content.service";
import type { DisclaimerPlacement } from "@/types";

export const runtime = "edge";

/** Public: active disclaimers for a placement (?placement=site|anime). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const placement = (url.searchParams.get("placement") as DisclaimerPlacement) || "site";
  const data = await getDisclaimersByPlacement(placement === "anime" ? "anime" : "site");
  return Response.json(
    { ok: true, data },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}
