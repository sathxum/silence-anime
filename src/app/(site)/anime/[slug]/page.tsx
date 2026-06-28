import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Languages, Layers } from "lucide-react";
import { getAnimeBySlug } from "@/services/anime.service";
import { EpisodeList } from "@/components/anime/episode-list";
import { env } from "@/lib/env";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const anime = await getAnimeBySlug(slug);
  if (!anime) return { title: "Not found" };
  const url = `${env.siteUrl}/anime/${anime.slug}`;
  return {
    title: anime.title,
    description: anime.description?.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      type: "video.tv_show",
      title: anime.title,
      description: anime.description?.slice(0, 200),
      url,
      images: anime.poster_url ? [{ url: anime.poster_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: anime.title,
      description: anime.description?.slice(0, 200),
      images: anime.poster_url ? [anime.poster_url] : undefined,
    },
  };
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const anime = await getAnimeBySlug(slug);
  if (!anime) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: anime.title,
    description: anime.description,
    image: anime.poster_url,
    numberOfEpisodes: anime.episodes.length,
    url: `${env.siteUrl}/anime/${anime.slug}`,
  };

  return (
    <article className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient banner backdrop */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        {anime.banner_url || anime.poster_url ? (
          <Image
            src={anime.banner_url || anime.poster_url}
            alt=""
            fill
            priority
            className="object-cover opacity-30 blur-2xl"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="container pt-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="grid gap-8 md:grid-cols-[280px_1fr] lg:gap-12">
          {/* Poster */}
          <div className="mx-auto w-full max-w-[280px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-3xl border border-border shadow-float">
              {anime.poster_url ? (
                <Image
                  src={anime.poster_url}
                  alt={anime.title}
                  fill
                  priority
                  sizes="280px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                  No poster
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              {anime.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-muted-foreground ring-1 ring-border">
                <Layers className="h-3.5 w-3.5" />
                {anime.episodes.length} Episodes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                <Languages className="h-3.5 w-3.5" />
                Hindi Dub Available
              </span>
            </div>

            <h2 className="mt-8 font-display text-lg font-semibold">About</h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
              {anime.description || "No description available."}
            </p>

            <h2 className="mt-10 font-display text-lg font-semibold">Episodes</h2>
            <div className="mt-4 max-w-2xl">
              <EpisodeList episodes={anime.episodes} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
