import type { NextRequest } from "next/server";
import { createPopup, getAllPopups } from "@/services/content.service";
import { popupSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/utils";

export const runtime = "edge";

export async function GET() {
  const popups = await getAllPopups();
  return Response.json({ ok: true, data: popups });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = popupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }
  const v = parsed.data;
  const popup = await createPopup({
    title: sanitizeText(v.title, 200),
    body: sanitizeText(v.body, 3000),
    image_url: v.image_url ?? null,
    link_url: v.link_url ?? null,
    link_label: sanitizeText(v.link_label ?? "Learn more", 60),
    dismiss_after_seconds: v.dismiss_after_seconds,
    is_active: v.is_active,
  });
  return Response.json({ ok: true, data: popup }, { status: 201 });
}
