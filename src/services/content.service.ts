import "server-only";
import { createServiceSupabase } from "@/lib/supabase";
import type {
  Popup,
  PopupInput,
  Disclaimer,
  DisclaimerInput,
  DisclaimerPlacement,
} from "@/types";

/**
 * Server-side data access for popups (notifications) and disclaimers.
 * Public reads are wrapped in safe() so a DB hiccup never breaks a page.
 */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ---------- Popups (public read) -------------------------------------------

export async function getActivePopups(): Promise<Popup[]> {
  return safe(async () => {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("popups")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []);
}

export async function getAllPopups(): Promise<Popup[]> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("popups")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPopup(input: PopupInput): Promise<Popup> {
  const db = createServiceSupabase();
  const { data: maxRow } = await db
    .from("popups")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (maxRow?.position ?? 0) + 1;

  const { data, error } = await db
    .from("popups")
    .insert({
      title: input.title,
      body: input.body,
      image_url: input.image_url ?? null,
      link_url: input.link_url ?? null,
      link_label: input.link_label ?? "Learn more",
      dismiss_after_seconds: clampDelay(input.dismiss_after_seconds),
      is_active: input.is_active ?? true,
      position: nextPosition,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePopup(id: string, input: PopupInput): Promise<Popup> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("popups")
    .update({
      title: input.title,
      body: input.body,
      image_url: input.image_url ?? null,
      link_url: input.link_url ?? null,
      link_label: input.link_label ?? "Learn more",
      dismiss_after_seconds: clampDelay(input.dismiss_after_seconds),
      is_active: input.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePopup(id: string): Promise<void> {
  const db = createServiceSupabase();
  const { error } = await db.from("popups").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function clampDelay(n: number): number {
  if (!Number.isFinite(n)) return 4;
  return Math.min(10, Math.max(1, Math.round(n)));
}

// ---------- Disclaimers -----------------------------------------------------

export async function getActiveDisclaimers(placement: DisclaimerPlacement): Promise<Disclaimer[]> {
  return safe(async () => {
    const db = createServiceSupabase();
    const { data, error } = await db
      .from("disclaimers")
      .select("*")
      .eq("is_active", true)
      .eq("placement", placement)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }, []);
}

export async function getDisclaimersByPlacement(placement: DisclaimerPlacement): Promise<Disclaimer[]> {
  return getActiveDisclaimers(placement);
}

export async function getAllDisclaimers(): Promise<Disclaimer[]> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("disclaimers")
    .select("*")
    .order("placement", { ascending: true })
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createDisclaimer(input: DisclaimerInput): Promise<Disclaimer> {
  const db = createServiceSupabase();
  const { data: maxRow } = await db
    .from("disclaimers")
    .select("position")
    .eq("placement", input.placement)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (maxRow?.position ?? 0) + 1;

  const { data, error } = await db
    .from("disclaimers")
    .insert({
      placement: input.placement,
      title: input.title ?? "",
      body: input.body,
      is_active: input.is_active ?? true,
      position: nextPosition,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateDisclaimer(id: string, input: DisclaimerInput): Promise<Disclaimer> {
  const db = createServiceSupabase();
  const { data, error } = await db
    .from("disclaimers")
    .update({
      placement: input.placement,
      title: input.title ?? "",
      body: input.body,
      is_active: input.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDisclaimer(id: string): Promise<void> {
  const db = createServiceSupabase();
  const { error } = await db.from("disclaimers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
