"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Save, ImageIcon, Star, Flame } from "lucide-react";
import { toast } from "sonner";
import type { Anime } from "@/types";
import { animeSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/admin-api";

interface Props {
  /** When provided, the form edits this anime; otherwise it creates a new one. */
  anime?: Anime;
}

export function AnimeForm({ anime }: Props) {
  const router = useRouter();
  const editing = !!anime;

  const [title, setTitle] = useState(anime?.title ?? "");
  const [description, setDescription] = useState(anime?.description ?? "");
  const [posterUrl, setPosterUrl] = useState(anime?.poster_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(anime?.banner_url ?? "");
  const [isFeatured, setIsFeatured] = useState(anime?.is_featured ?? false);
  const [isTrending, setIsTrending] = useState(anime?.is_trending ?? false);
  const [posterOk, setPosterOk] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = animeSchema.safeParse({
      title,
      description,
      poster_url: posterUrl,
      banner_url: bannerUrl,
      is_featured: isFeatured,
      is_trending: isTrending,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateAnime(anime.id, parsed.data);
        toast.success("Anime updated");
      } else {
        const created = await adminApi.createAnime(parsed.data);
        toast.success("Anime created");
        router.push(`/admin/anime/${created.id}`);
        return;
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Field label="Anime Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Solo Leveling" required />
        </Field>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short, compelling synopsis…"
            rows={5}
          />
        </Field>

        <Field label="Poster URL" required hint="Portrait image (2:3). Used on cards & details.">
          <Input
            value={posterUrl}
            onChange={(e) => {
              setPosterUrl(e.target.value);
              setPosterOk(true);
            }}
            placeholder="https://…/poster.jpg"
            type="url"
            required
          />
        </Field>

        <Field label="Banner URL" hint="Optional wide image (16:9) for the hero & detail backdrop.">
          <Input
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://…/banner.jpg"
            type="url"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleCard
            icon={<Star className="h-4 w-4" />}
            label="Featured"
            description="Show in the hero banner"
            checked={isFeatured}
            onChange={setIsFeatured}
          />
          <ToggleCard
            icon={<Flame className="h-4 w-4" />}
            label="Trending"
            description="Show in the trending row"
            checked={isTrending}
            onChange={setIsTrending}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editing ? "Save changes" : "Create anime"}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.push("/admin/anime")}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Live preview</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-float">
          <div className="relative aspect-[2/3] w-full bg-muted">
            {posterUrl && posterOk ? (
              <Image
                src={posterUrl}
                alt="Poster preview"
                fill
                sizes="320px"
                className="object-cover"
                onError={() => setPosterOk(false)}
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">{posterUrl ? "Couldn't load image" : "Poster preview"}</span>
              </div>
            )}
          </div>
          <div className="space-y-1 p-4">
            <p className="font-display font-semibold">{title || "Anime title"}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {description || "Your description will appear here."}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ToggleCard({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
