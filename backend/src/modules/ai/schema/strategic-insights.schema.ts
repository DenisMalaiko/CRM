import { z } from 'zod';

export const StrategicInsightSchema = z.object({
  type: z.enum(['strength', 'improvement', 'opportunity']),
  title: z.string(),
  description: z.string(),
});

export const StrategicInsightsResponseSchema = z.object({
  insights: z.array(StrategicInsightSchema).length(6),
});

export type TStrategicInsight = z.infer<typeof StrategicInsightSchema>;
