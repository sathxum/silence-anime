import type { NextRequest } from "next/server";
import { updateDisclaimer, deleteDisclaimer } from "@/services/content.service";
import { disclaimerSchema } from "@/lib/validation";
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
  const parsed = disclaimerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 },
    );
  }
  const v = parsed.data;
  const disclaimer = await updateDisclaimer(id, {
    title: sanitizeText(v.title, 200),
    body: sanitizeText(v.body, 5000),
    placement: v.placement,
    is_active: v.is_active,
  });
  return Response.json({ ok: true, data: disclaimer });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteDisclaimer(id);
  return Response.json({ ok: true });
}
