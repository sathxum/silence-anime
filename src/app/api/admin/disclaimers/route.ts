import type { NextRequest } from "next/server";
import { createDisclaimer, getAllDisclaimers } from "@/services/content.service";
import { disclaimerSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/utils";

export const runtime = "edge";

export async function GET() {
  const disclaimers = await getAllDisclaimers();
  return Response.json({ ok: true, data: disclaimers });
}

export async function POST(req: NextRequest) {
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
  const disclaimer = await createDisclaimer({
    title: sanitizeText(v.title, 200),
    body: sanitizeText(v.body, 5000),
    placement: v.placement,
    is_active: v.is_active,
  });
  return Response.json({ ok: true, data: disclaimer }, { status: 201 });
}
