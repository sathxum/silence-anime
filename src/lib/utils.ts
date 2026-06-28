import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Slugify a title for clean URLs. Deterministic & URL-safe. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Basic string sanitizer — trims and strips angle brackets to blunt XSS. */
export function sanitizeText(input: unknown, maxLen = 5000): string {
  if (typeof input !== "string") return "";
  return input.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

/** Validate a URL is http(s). Returns the trimmed URL or null. */
export function sanitizeUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Human-friendly relative time, e.g. "3h ago". */
export function timeAgo(iso: string): string {
  const date = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - date) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let value = seconds;
  let unit = "s";
  for (const [factor, label] of units) {
    if (value < factor) {
      unit = label;
      break;
    }
    value = Math.floor(value / factor);
    unit = label;
  }
  if (seconds < 60) return "just now";
  return `${value}${unit} ago`;
}
