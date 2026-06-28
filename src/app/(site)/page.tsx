import { Suspense } from "react";
import {
  getFeaturedAnime,
  getTrendingAnime,
  getLatestAnime,
  getAllAnime,
} from "@/services/anime.service";
import { HeroBanner } from "@/components/anime/hero-banner";
import { AnimeRow } from "@/components/anime/anime-row";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { EmptyState } from "@/components/site/empty-state";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, trending, latest, all] = await Promise.all([
    getFeaturedAnime(6),
    getTrendingAnime(14),
    getLatestAnime(14),
    getAllAnime(),
  ]);

  const heroItems = featured.length > 0 ? featured : latest.slice(0, 5);

  if (all.length === 0) {
    return (
      <div className="container py-24">
        <EmptyState
          title="No anime yet"
          description="The catalogue is empty. Head to the admin dashboard to add your first title."
        />
      </div>
    );
  }

  return (
    <div className="pb-10">
      {heroItems.length > 0 && <HeroBanner items={heroItems} />}

      <AnimeRow id="trending" title="Trending Now" accent="Hot this week" items={trending} />
      <AnimeRow id="latest" title="Latest Anime" accent="Fresh drops" items={latest} />

      <section id="browse" className="container scroll-mt-24 py-10">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Full catalogue
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Recently Added
          </h2>
        </div>
        <AnimeGrid items={all} />
      </section>
    </div>
  );
}
