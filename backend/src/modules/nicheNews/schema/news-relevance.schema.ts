import { z } from 'zod';

export const NewsRelevanceSchema = z.object({
  relevantIndexes: z.array(z.number().int().nonnegative()),
});

export type NewsRelevanceResult = z.infer<typeof NewsRelevanceSchema>;
