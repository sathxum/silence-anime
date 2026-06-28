import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAnimeById, getEpisodesForAnime } from "@/services/anime.service";
import { AnimeEditWorkspace } from "@/components/admin/anime-edit-workspace";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function EditAnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [anime, episodes] = await Promise.all([
    getAnimeById(id),
    getEpisodesForAnime(id),
  ]);
  if (!anime) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/admin/anime"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Link>
        <h1 className="font-display text-3xl font-bold">{anime.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit details, manage episodes, and view per-link click analytics.
        </p>
      </div>
      <AnimeEditWorkspace anime={anime} episodes={episodes} />
    </div>
  );
}
