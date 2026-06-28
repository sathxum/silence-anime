"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { Anime } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/site/empty-state";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function AnimeManager({ initialAnime }: { initialAnime: Anime[] }) {
  const [anime, setAnime] = useState<Anime[]>(initialAnime);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Anime | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return anime;
    return anime.filter((a) => a.title.toLowerCase().includes(q));
  }, [anime, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteAnime(deleteTarget.id);
      setAnime((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success(`Deleted "${deleteTarget.title}"`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Anime Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {anime.length} {anime.length === 1 ? "title" : "titles"} in your catalog
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/anime/new">
            <PlusCircle className="h-4 w-4" /> Add Anime
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search your library…"
          className="pl-10"
        />
      </div>

      {pageItems.length === 0 ? (
        <EmptyState
          title={query ? "No matches" : "No anime yet"}
          description={query ? "Try a different search." : "Add your first anime to get started."}
          action={
            !query && (
              <Button asChild>
                <Link href="/admin/anime/new">
                  <PlusCircle className="h-4 w-4" /> Add Anime
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <AnimatePresence initial={false}>
            {pageItems.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 border-b border-border/60 p-4 last:border-0 hover:bg-muted/40"
              >
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {a.poster_url ? (
                    <Image src={a.poster_url} alt={a.title} fill sizes="48px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{a.title}</p>
                    {a.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        <Star className="h-3 w-3" /> Featured
                      </span>
                    )}
                    {a.is_trending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                        <Flame className="h-3 w-3" /> Trending
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{a.description || "No description"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button asChild variant="ghost" size="icon" title="Manage episodes & edit">
                    <Link href={`/admin/anime/${a.id}`}>
                      <Layers className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" title="View live">
                    <Link href={`/anime/${a.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" title="Edit">
                    <Link href={`/admin/anime/${a.id}?tab=details`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(a)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete anime?"
        description={`This permanently removes "${deleteTarget?.title}" and all its episodes. This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
