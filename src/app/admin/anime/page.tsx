import { getAllAnime } from "@/services/anime.service";
import { AnimeManager } from "@/components/admin/anime-manager";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminAnimeListPage() {
  const anime = await getAllAnime();
  return <AnimeManager initialAnime={anime} />;
}
