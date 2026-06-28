import { getActivePopups } from "@/services/content.service";

export const runtime = "edge";

/** Public: active popups shown to visitors on site open. */
export async function GET() {
  const popups = await getActivePopups();
  return Response.json(
    { ok: true, data: popups },
    { headers: { "cache-control": "public, max-age=30" } },
  );
}
