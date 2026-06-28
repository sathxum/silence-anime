"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import type { Popup } from "@/types";

/**
 * Popup notification queue.
 *
 * On site open, fetches active popups and shows them ONE AT A TIME in a
 * premium centered modal. Each popup has an admin-configured delay
 * (`dismiss_after_seconds`, 1–10s) before its close button becomes active —
 * a live ring countdown shows the remaining time. Closing one advances to
 * the next; when the queue is empty the overlay disappears.
 *
 * Shown once per browser session (sessionStorage) so visitors aren't nagged
 * on every navigation.
 */

const SESSION_KEY = "silence_popups_seen";

export function PopupQueue() {
  const [queue, setQueue] = useState<Popup[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [open, setOpen] = useState(false);

  // Fetch active popups once per session.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/popups", { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean; data: Popup[] };
        if (cancelled || !json.ok || json.data.length === 0) return;
        setQueue(json.data);
        setOpen(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* silently ignore — popups are non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = queue[index];

  // Countdown timer for the active popup.
  useEffect(() => {
    if (!open || !current) return;
    const total = Math.min(Math.max(current.dismiss_after_seconds ?? 4, 1), 10);
    setRemaining(total);
    const started = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      const left = Math.max(0, total - elapsed);
      setRemaining(left);
      if (left <= 0) clearInterval(tick);
    }, 100);
    return () => clearInterval(tick);
  }, [open, current]);

  const next = useCallback(() => {
    if (index + 1 < queue.length) {
      setIndex((i) => i + 1);
    } else {
      setOpen(false);
    }
  }, [index, queue.length]);

  if (!open || !current) return null;

  const canClose = remaining <= 0;
  const total = Math.min(Math.max(current.dismiss_after_seconds ?? 4, 1), 10);
  const progress = 1 - remaining / total; // 0 -> 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop — does NOT close on click (must use the timed button). */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

        <motion.div
          key={current.id}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-float"
        >
          {/* Queue progress dots */}
          {queue.length > 1 && (
            <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 gap-1.5">
              {queue.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-primary" : "w-1.5 bg-foreground/25"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Close button with circular countdown */}
          <button
            type="button"
            onClick={canClose ? next : undefined}
            disabled={!canClose}
            aria-label={canClose ? "Close" : `Wait ${Math.ceil(remaining)}s`}
            className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition ${
              canClose
                ? "bg-foreground/10 text-foreground hover:bg-foreground/20"
                : "cursor-not-allowed text-muted-foreground"
            }`}
          >
            {canClose ? (
              <X className="h-4 w-4" />
            ) : (
              <span className="relative flex h-9 w-9 items-center justify-center">
                <svg className="absolute h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-foreground/15"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={2 * Math.PI * 15 * (1 - progress)}
                  />
                </svg>
                <span className="text-[11px] font-semibold tabular-nums">
                  {Math.ceil(remaining)}
                </span>
              </span>
            )}
          </button>

          {current.image_url && (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image_url}
                alt={current.title || "Notification"}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
          )}

          <div className="space-y-3 p-6 pt-8">
            {current.title && (
              <h3 className="font-display text-xl font-bold tracking-tight">
                {current.title}
              </h3>
            )}
            {current.body && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {current.body}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              {current.link_url && (
                <a
                  href={current.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
                >
                  {current.link_label || "Learn more"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={canClose ? next : undefined}
                disabled={!canClose}
                className={`text-sm font-medium transition ${
                  canClose
                    ? "text-foreground hover:text-primary"
                    : "cursor-not-allowed text-muted-foreground"
                }`}
              >
                {canClose
                  ? index + 1 < queue.length
                    ? "Next"
                    : "Close"
                  : `Skip in ${Math.ceil(remaining)}s`}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
