import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "edge";

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append(
    "set-cookie",
    `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly; Secure`,
  );
  return res;
}
