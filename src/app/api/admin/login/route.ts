import type { NextRequest } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { sanitizeText } from "@/lib/utils";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  // Strict limit to blunt brute-force: 8 attempts / 5 min per IP.
  const limit = rateLimit(`login:${ip}`, 8, 5 * 60_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; password?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const email = sanitizeText(body.email, 200);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return Response.json({ ok: false, error: "Email and password required" }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    return Response.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = Response.json({ ok: true });
  // Set the signed session cookie.
  const cookie = serializeCookie(SESSION_COOKIE, token, sessionCookieOptions);
  res.headers.append("set-cookie", cookie);
  return res;
}

function serializeCookie(
  name: string,
  value: string,
  opts: { httpOnly: boolean; secure: boolean; sameSite: string; path: string; maxAge: number },
): string {
  const parts = [
    `${name}=${value}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    `SameSite=${opts.sameSite[0]?.toUpperCase()}${opts.sameSite.slice(1)}`,
  ];
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}
