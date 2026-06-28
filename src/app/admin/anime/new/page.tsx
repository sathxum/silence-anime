import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimeForm } from "@/components/admin/anime-form";

export const runtime = "edge";

export default function NewAnimePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/anime"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">Add New Anime</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create the title first — you can add episodes right after.
        </p>
      </div>
      <AnimeForm />
    </div>
  );
}
