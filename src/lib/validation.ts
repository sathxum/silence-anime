import { z } from "zod";

/** Zod schemas shared across admin write endpoints. */

export const animeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).default(""),
  poster_url: z.string().trim().url("Poster must be a valid URL"),
  banner_url: z
    .string()
    .trim()
    .url("Banner must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  is_featured: z.boolean().optional().default(false),
  is_trending: z.boolean().optional().default(false),
});

export const episodeSchema = z.object({
  anime_id: z.string().uuid(),
  episode_number: z.coerce.number().int().min(0).max(100000),
  name: z.string().trim().min(1, "Episode name is required").max(200),
  title: z.string().trim().max(300).optional().default(""),
  redirect_url: z.string().trim().url("Redirect link must be a valid URL"),
  is_hindi_dub: z.boolean().optional().default(true),
});

export const reorderSchema = z.object({
  anime_id: z.string().uuid(),
  ordered_ids: z.array(z.string().uuid()).min(1),
});

export type AnimeFormValues = z.input<typeof animeSchema>;
export type EpisodeFormValues = z.input<typeof episodeSchema>;
