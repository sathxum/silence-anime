"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Play, ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { Anime } from "@/types";

/**
 * Cinematic auto-rotating hero banner for featured anime. Cross-fading
 * backdrops, parallax title block, manual controls + dots.
 */
export function HeroBanner({ items }: { items: Anime[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const active = items[index]!;
  const backdrop = active.banner_url || active.poster_url;

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {backdrop && (
            <Image
              src={backdrop}
              alt={active.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      <div className="container relative flex h-full flex-col justify-end pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
              Featured
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {active.title}
            </h1>
            <p className="mt-4 line-clamp-3 max-w-xl text-base text-muted-foreground sm:text-lg">
              {active.description}
            </p>
            <div className="mt-7 flex items-center gap-3">
              <Link
                href={`/anime/${active.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
              >
                <Play className="h-5 w-5 fill-current" /> Watch Now
              </Link>
              <Link
                href={`/anime/${active.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-6 py-3 font-semibold backdrop-blur transition-colors hover:bg-card"
              >
                <Info className="h-5 w-5" /> Details
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/60 p-3 backdrop-blur transition-colors hover:bg-card md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/60 p-3 backdrop-blur transition-colors hover:bg-card md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-primary" : "w-3 bg-foreground/30 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
