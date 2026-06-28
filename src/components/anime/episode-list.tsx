"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Languages } from "lucide-react";
import type { Episode } from "@/types";

/**
 * Episode list for the details page. Each card shows the episode number,
 * name, an automatic "Hindi Dub" badge, and a play button. Clicking play
 * records the click (POST /api/track) then redirects to the external link.
 * The player is NOT embedded — we only redirect.
 */
export function EpisodeList({ episodes }: { episodes: Episode[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handlePlay(ep: Episode) {
    if (loadingId) return;
    setLoadingId(ep.id);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode_id: ep.id }),
      });
      const json = (await res.json()) as { ok: boolean; redirect_url?: string };
      const url = json.ok && json.redirect_url ? json.redirect_url : ep.redirect_url;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // Even if tracking fails, still send the user to the episode.
      window.open(ep.redirect_url, "_blank", "noopener,noreferrer");
    } finally {
      setLoadingId(null);
    }
  }

  if (episodes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-10 text-center text-muted-foreground">
        No episodes added yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {episodes.map((ep, i) => (
        <motion.button
          key={ep.id}
          type="button"
          onClick={() => handlePlay(ep)}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
          whileHover={{ x: 4 }}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-3 text-left backdrop-blur transition-colors hover:border-primary/50 hover:bg-card"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {String(ep.episode_number).padStart(2, "0")}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{ep.name}</p>
              {ep.is_hindi_dub && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  <Languages className="h-3 w-3" />
                  Hindi Dub
                </span>
              )}
            </div>
            {ep.title && <p className="truncate text-sm text-muted-foreground">{ep.title}</p>}
          </div>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-110">
            {loadingId === ep.id ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
