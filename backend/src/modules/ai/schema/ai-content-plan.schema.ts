import { z } from 'zod';

export const StrategistPostSchema = z.object({
  day: z.number(),
  date: z.string(),
  funnelStage: z.enum(['TOFU', 'MOFU', 'BOFU']),
  format: z.string(),
  contentType: z.string(),
  topic: z.string(),
  marketingGoal: z.string(),
});

export const StrategistResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  posts: z.array(StrategistPostSchema).min(1),
});

export const CopywriterPostSchema = StrategistPostSchema.extend({
  title: z.string(),
  hook: z.string(),
  thesis: z.string(),
  cta: z.string(),
});

export const CopywriterResponseSchema = z.object({
  posts: z.array(CopywriterPostSchema).min(1),
});

export const ContentPlanPostPhotoSchema = z.object({
  photoId: z.string(),
  url: z.string(),
});

export const ContentPlanPostSchema = CopywriterPostSchema.extend({
  designReference: z.string(),
  photos: z.array(ContentPlanPostPhotoSchema).default([]),
});

export const ContentPlanResponseSchema = z.object({
  posts: z.array(ContentPlanPostSchema).min(1),
});

export const PhotoMatcherResponseSchema = z.object({
  photoId: z.string().nullable(),
});

export type TContentPlanPostPhoto = z.infer<typeof ContentPlanPostPhotoSchema>;
export type TContentPlanPost = z.infer<typeof ContentPlanPostSchema>;
