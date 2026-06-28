"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import type { MouseEvent } from "react";
import type { Anime } from "@/types";

/**
 * Premium anime card with a real 3D tilt that follows the cursor, a glow lift
 * on hover, and an animated play affordance. Poster images are lazy-loaded
 * and optimized via next/image.
 */
export function AnimeCard({ anime, priority = false }: { anime: Anime; priority?: boolean }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 180, damping: 18 });
  const glowX = useTransform(rotateY, [-8, 8], ["0%", "100%"]);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 14);
    rx.set((0.5 - py) * 14);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <Link href={`/anime/${anime.slug}`} className="group block">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-float transition-shadow duration-300 group-hover:shadow-glow"
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
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No poster</div>
          )}

          {/* gradient + moving glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />
          <motion.div
            style={{ left: glowX }}
            className="pointer-events-none absolute top-0 h-full w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-glow backdrop-blur transition-transform duration-300 group-hover:scale-100 scale-75">
              <Play className="h-6 w-6 fill-current" />
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-1 font-display text-base font-semibold text-white drop-shadow">
            {anime.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">
            {anime.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
