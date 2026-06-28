"use client";

import { motion } from "framer-motion";
import { AnimeCard } from "@/components/anime/anime-card";
import type { Anime } from "@/types";

export function AnimeGrid({ items }: { items: Anime[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((anime, i) => (
        <motion.div
          key={anime.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.25) }}
        >
          <AnimeCard anime={anime} priority={i < 6} />
        </motion.div>
      ))}
    </div>
  );
}
