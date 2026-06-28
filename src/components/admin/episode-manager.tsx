"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Pencil,
  Trash2,
  PlusCircle,
  Loader2,
  Save,
  X,
  Languages,
  MousePointerClick,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { EpisodeWithClicks } from "@/types";
import { episodeSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/site/empty-state";
import { adminApi } from "@/lib/admin-api";
import { cn, formatNumber } from "@/lib/utils";

interface Props {
  animeId: string;
  initialEpisodes: EpisodeWithClicks[];
  onChange?: (episodes: EpisodeWithClicks[]) => void;
}

const HINDI_DUB = "Hindi Dub";

export function EpisodeManager({ animeId, initialEpisodes, onChange }: Props) {
  const [episodes, setEpisodes] = useState<EpisodeWithClicks[]>(initialEpisodes);
  const [editing, setEditing] = useState<EpisodeWithClicks | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EpisodeWithClicks | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    onChange?.(episodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = episodes.findIndex((e) => e.id === active.id);
    const newIndex = episodes.findIndex((e) => e.id === over.id);
    const next = arrayMove(episodes, oldIndex, newIndex);
    setEpisodes(next);
    try {
      await adminApi.reorderEpisodes(animeId, next.map((e) => e.id));
    } catch (err) {
      toast.error("Failed to save new order");
      setEpisodes(episodes); // revert
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteEpisode(deleteTarget.id);
      setEpisodes((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Episode deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  function upsertLocal(ep: EpisodeWithClicks) {
    setEpisodes((prev) => {
      const exists = prev.some((e) => e.id === ep.id);
      return exists ? prev.map((e) => (e.id === ep.id ? ep : e)) : [...prev, ep];
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Episodes</h2>
          <p className="text-sm text-muted-foreground">
            {episodes.length} {episodes.length === 1 ? "episode" : "episodes"} · drag to reorder
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <PlusCircle className="h-4 w-4" /> Add Episode
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <EpisodeForm
            animeId={animeId}
            episode={editing}
            nextNumber={
              episodes.reduce((max, e) => Math.max(max, e.episode_number), 0) + 1
            }
            onClose={() => setShowForm(false)}
            onSaved={(ep) => {
              upsertLocal(ep);
              setShowForm(false);
            }}
          />
        )}
      </AnimatePresence>

      {episodes.length === 0 && !showForm ? (
        <EmptyState
          title="No episodes yet"
          description="Add the first episode. The “Hindi Dub” badge is applied automatically."
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={episodes.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {episodes.map((ep) => (
                <SortableEpisode
                  key={ep.id}
                  episode={ep}
                  onEdit={() => {
                    setEditing(ep);
                    setShowForm(true);
                  }}
                  onDelete={() => setDeleteTarget(ep)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete episode?"
        description={`This permanently removes "${deleteTarget?.name}". This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SortableEpisode({
  episode,
  onEdit,
  onDelete,
}: {
  episode: EpisodeWithClicks;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: episode.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
        isDragging && "z-10 shadow-float ring-2 ring-primary/40",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded-md p-1.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
        {episode.episode_number}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{episode.name}</p>
          {episode.is_hindi_dub && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
              <Languages className="h-3 w-3" /> {HINDI_DUB}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {episode.title && <span className="truncate">{episode.title}</span>}
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="h-3 w-3" /> {formatNumber(episode.click_count)} clicks
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={episode.redirect_url}
          target="_blank"
          rel="noreferrer"
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Open link"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <Button variant="ghost" size="icon" onClick={onEdit} title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EpisodeForm({
  animeId,
  episode,
  nextNumber,
  onClose,
  onSaved,
}: {
  animeId: string;
  episode: EpisodeWithClicks | null;
  nextNumber: number;
  onClose: () => void;
  onSaved: (ep: EpisodeWithClicks) => void;
}) {
  const editing = !!episode;
  const [episodeNumber, setEpisodeNumber] = useState(String(episode?.episode_number ?? nextNumber));
  const [name, setName] = useState(episode?.name ?? `Episode ${episode?.episode_number ?? nextNumber}`);
  const [title, setTitle] = useState(episode?.title ?? "");
  const [redirectUrl, setRedirectUrl] = useState(episode?.redirect_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      anime_id: animeId,
      episode_number: episodeNumber,
      name,
      title,
      redirect_url: redirectUrl,
      is_hindi_dub: true,
    };
    const parsed = episodeSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSaving(true);
    try {
      const saved = editing
        ? await adminApi.updateEpisode(episode.id, parsed.data)
        : await adminApi.createEpisode(parsed.data);
      toast.success(editing ? "Episode updated" : "Episode added");
      onSaved({ ...saved, click_count: episode?.click_count ?? 0 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-border bg-card p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display font-semibold">{editing ? "Edit episode" : "New episode"}</h3>
        <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Number</span>
          <Input
            type="number"
            min={0}
            value={episodeNumber}
            onChange={(e) => setEpisodeNumber(e.target.value)}
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Episode Name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Episode 1" required />
        </label>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium">Episode Title</span>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Awakening (optional)" />
      </label>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium">
          Redirect Link <span className="text-destructive">*</span>
        </span>
        <Input
          type="url"
          value={redirectUrl}
          onChange={(e) => setRedirectUrl(e.target.value)}
          placeholder="https://…"
          required
        />
        <span className="block text-xs text-muted-foreground">
          The play button sends viewers here. Clicks are tracked automatically.
        </span>
      </label>

      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500">
        <Languages className="h-3 w-3" /> {HINDI_DUB} badge added automatically
      </div>

      <div className="mt-5 flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {editing ? "Save episode" : "Add episode"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}
