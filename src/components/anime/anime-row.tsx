"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "@/components/anime/anime-card";
import type { Anime } from "@/types";

/** Horizontally-scrolling slider row with snap + arrow controls. */
export function AnimeRow({
  id,
  title,
  items,
  accent,
}: {
  id?: string;
  title: string;
  items: Anime[];
  accent?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section id={id} className="container scroll-mt-24 py-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          {accent && (
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {accent}
            </span>
          )}
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-border bg-card/60 p-2 transition-colors hover:bg-card"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-border bg-card/60 p-2 transition-colors hover:bg-card"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((anime, i) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
            className="w-[160px] shrink-0 snap-start sm:w-[200px]"
          >
            <AnimeCard anime={anime} priority={i < 3} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
