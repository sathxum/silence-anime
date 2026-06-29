"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Play, Star, Flame } from "lucide-react";
import type { MouseEvent } from "react";
import type { Anime } from "@/types";

/**
 * Premium anime card with a real 3D tilt that follows the cursor, a glassy
 * raised look, floating depth layers, and a frosted info panel that lifts on
 * hover. Poster images are lazy-loaded and optimized via next/image.
 */
export function AnimeCard({ anime, priority = false }: { anime: Anime; priority?: boolean }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 180, damping: 18 });
  const glowX = useTransform(rotateY, [-10, 10], ["0%", "100%"]);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 16);
    rx.set((0.5 - py) * 16);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <Link href={`/anime/${anime.slug}`} className="group block [perspective:1000px]">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }}
        whileHover={{ y: -8, scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="card-3d glass-spec relative overflow-hidden rounded-2xl border border-white/10 bg-card shadow-float transition-shadow duration-300 group-hover:shadow-glow"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          {anime.poster_url ? (
            <Image
              src={anime.poster_url}
              alt={anime.title}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No poster</div>
          )}

          {/* depth gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent opacity-90" />

          {/* moving specular sweep */}
          <motion.div
            style={{ left: glowX }}
            className="pointer-events-none absolute top-0 h-full w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* floating badges (raised in 3D) */}
          <div
            className="absolute left-3 top-3 flex flex-col gap-1.5"
            style={{ transform: "translateZ(40px)" }}
          >
            {anime.is_trending && (
              <span className="raised inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                <Flame className="h-3 w-3" /> Hot
              </span>
            )}
            {anime.is_featured && (
              <span className="raised inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black backdrop-blur">
                <Star className="h-3 w-3 fill-current" /> Featured
              </span>
            )}
          </div>

          {/* play button — pops toward viewer */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ transform: "translateZ(60px)" }}
          >
            <span className="raised flex h-16 w-16 scale-75 items-center justify-center rounded-full bg-primary/90 text-primary-foreground ring-2 ring-white/25 backdrop-blur transition-transform duration-300 group-hover:scale-100">
              <Play className="h-7 w-7 fill-current" />
            </span>
          </div>
        </div>

        {/* frosted glass info panel, lifted on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 p-3"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="glass-3d rounded-xl px-3 py-2.5">
            <h3 className="line-clamp-1 font-display text-sm font-semibold text-white drop-shadow">
              {anime.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-white/70">
              {anime.description || "Tap to watch"}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
