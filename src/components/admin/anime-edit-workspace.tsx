"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  ListVideo,
  BarChart3,
  ExternalLink,
  MousePointerClick,
  Languages,
} from "lucide-react";
import type { Anime, Episode } from "@/types";
import { AnimeForm } from "@/components/admin/anime-form";
import { EpisodeManager } from "@/components/admin/episode-manager";
import { cn, formatNumber } from "@/lib/utils";

type Tab = "details" | "episodes" | "analytics";

export function AnimeEditWorkspace({
  anime,
  episodes: initialEpisodes,
}: {
  anime: Anime;
  episodes: Episode[];
}) {
  const [tab, setTab] = useState<Tab>("details");
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);

  const tabs: { key: Tab; label: string; icon: typeof Pencil }[] = [
    { key: "details", label: "Details", icon: Pencil },
    { key: "episodes", label: "Episodes", icon: ListVideo },
    { key: "analytics", label: "Link Analytics", icon: BarChart3 },
  ];

  const ranked = useMemo(
    () => [...episodes].sort((a, b) => b.click_count - a.click_count),
    [episodes],
  );
  const maxClicks = ranked[0]?.click_count ?? 0;
  const totalClicks = episodes.reduce((s, e) => s + e.click_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/50 p-1.5">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab-pill"
                  className="absolute inset-0 rounded-xl bg-primary shadow-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <t.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "details" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <AnimeForm anime={anime} />
        </motion.div>
      )}

      {tab === "episodes" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <EpisodeManager animeId={anime.id} initialEpisodes={episodes} onChange={setEpisodes} />
        </motion.div>
      )}

      {tab === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card/50 p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Per-link click analytics</h3>
              <p className="text-sm text-muted-foreground">
                Exactly how many times each episode link was opened.
              </p>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-primary">
                {formatNumber(totalClicks)}
              </div>
              <div className="text-xs text-muted-foreground">total clicks</div>
            </div>
          </div>

          {ranked.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No episodes yet. Add some in the Episodes tab.
            </p>
          ) : (
            <div className="space-y-3">
              {ranked.map((ep, i) => {
                const pct = maxClicks > 0 ? Math.round((ep.click_count / maxClicks) * 100) : 0;
                return (
                  <div
                    key={ep.id}
                    className="rounded-xl border border-border/70 bg-background/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                          #{i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            EP {ep.episode_number} · {ep.name}
                          </p>
                          <a
                            href={ep.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary"
                          >
                            <span className="truncate">{ep.redirect_url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
                        <MousePointerClick className="h-4 w-4 text-primary" />
                        {formatNumber(ep.click_count)}
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
