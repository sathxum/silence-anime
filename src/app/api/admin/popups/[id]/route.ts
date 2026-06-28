import type { NextRequest } from "next/server";
import { updatePopup, deletePopup } from "@/services/content.service";
import { popupSchema } from "@/lib/validation";
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
  const parsed = popupSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }
  const v = parsed.data;
  const popup = await updatePopup(id, {
    title: sanitizeText(v.title, 200),
    body: sanitizeText(v.body, 3000),
    image_url: v.image_url ?? null,
    link_url: v.link_url ?? null,
    link_label: sanitizeText(v.link_label ?? "Learn more", 60),
    dismiss_after_seconds: v.dismiss_after_seconds,
    is_active: v.is_active,
  });
  return Response.json({ ok: true, data: popup });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deletePopup(id);
  return Response.json({ ok: true });
}
