import { z } from 'zod';

export const ContentPlanPostSchema = z.object({
  date: z.string(),
  format: z.string(),
  contentType: z.string(),
  title: z.string(),
  rubric: z.string(),
  designReference: z.string(),
  thesis: z.string(),
});

export const ContentPlanResponseSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    posts: z.array(ContentPlanPostSchema).min(1),
  })
  .passthrough();
