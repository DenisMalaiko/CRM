import { z } from 'zod';
import { ContentPlanPostSchema } from '../../ai/schema/ai-content-plan.schema';

export type TContentPlanPost = z.infer<typeof ContentPlanPostSchema>;
