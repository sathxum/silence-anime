import { getAllAnime } from "@/services/anime.service";
import { HeroBanner } from "@/components/anime/hero-banner";
import { AnimeRow } from "@/components/anime/anime-row";
import { AnimeGrid } from "@/components/anime/anime-grid";
import { EmptyState } from "@/components/site/empty-state";
import type { Anime } from "@/types";

export const runtime = "edge";
// Cache the rendered page at the edge for 60s. Visitors get static HTML
// (near-zero CPU) instead of a fresh DB render on every request — this is
// what keeps us under Cloudflare's Worker CPU limit.
export const revalidate = 60;

export default async function HomePage() {
  // ONE query — derive every section in memory instead of 4 round trips.
  const all = await getAllAnime();

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

  const featured = all.filter((a: Anime) => a.is_featured).slice(0, 6);
  const trending = all.filter((a: Anime) => a.is_trending).slice(0, 14);
  const latest = all.slice(0, 14);
  const heroItems = featured.length > 0 ? featured : latest.slice(0, 5);

  return (
    <div className="pb-10">
      {heroItems.length > 0 && <HeroBanner items={heroItems} />}

      {trending.length > 0 && (
        <AnimeRow id="trending" title="Trending Now" accent="Hot this week" items={trending} />
      )}
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
