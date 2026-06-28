import type { MetadataRoute } from "next";
import { getAllAnime } from "@/services/anime.service";
import { env } from "@/lib/env";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  let animeRoutes: MetadataRoute.Sitemap = [];
  try {
    const anime = await getAllAnime();
    animeRoutes = anime.map((a) => ({
      url: `${base}/anime/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If the DB isn't reachable at build/request time, still emit the home route.
  }
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...animeRoutes,
  ];
}
