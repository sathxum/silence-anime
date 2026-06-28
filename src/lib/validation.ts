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

export const popupSchema = z.object({
  title: z.string().trim().max(200).default(""),
  body: z.string().trim().max(3000).default(""),
  image_url: z
    .string()
    .trim()
    .url("Image must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  link_url: z
    .string()
    .trim()
    .url("Link must be a valid URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  link_label: z.string().trim().max(60).optional().default("Learn more"),
  dismiss_after_seconds: z.coerce.number().int().min(1).max(10).default(4),
  is_active: z.boolean().optional().default(true),
}).refine((v) => v.title.length > 0 || v.body.length > 0, {
  message: "Add a title or some body text",
  path: ["title"],
});

export const disclaimerSchema = z.object({
  placement: z.enum(["site", "anime"]),
  title: z.string().trim().max(200).optional().default(""),
  body: z.string().trim().min(1, "Disclaimer text is required").max(3000),
  is_active: z.boolean().optional().default(true),
});

export type AnimeFormValues = z.input<typeof animeSchema>;
export type EpisodeFormValues = z.input<typeof episodeSchema>;
export type PopupFormValues = z.input<typeof popupSchema>;
export type DisclaimerFormValues = z.input<typeof disclaimerSchema>;
