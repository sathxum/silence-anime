/**
 * Admin authentication.
 *
 * - Credentials live ONLY in environment variables (never the database).
 * - Sessions are stateless, signed HMAC tokens stored in an httpOnly cookie.
 * - Uses Web Crypto (globalThis.crypto.subtle) so it runs on the Cloudflare
 *   edge runtime as well as Node.
 */

import { env } from "@/lib/env";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

const encoder = new TextEncoder();

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of view) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(env.authSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(sig);
}

/** Constant-time string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Validate raw email/password against env credentials (constant-time). */
export function verifyCredentials(email: string, password: string): boolean {
  const emailOk = safeEqual(email.trim().toLowerCase(), env.adminEmail.trim().toLowerCase());
  const passOk = safeEqual(password, env.adminPassword);
  // Evaluate both to avoid early-exit timing leaks.
  return emailOk && passOk;
}

/** Create a signed session token. */
export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payloadObj = { sub: "admin", exp };
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(payloadObj)));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Verify a session token; returns true when valid and unexpired. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts as [string, string];
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return false;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as {
      sub: string;
      exp: number;
    };
    if (json.sub !== "admin") return false;
    if (json.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
