import { z } from 'zod';

export interface FalGenerateInput {
  prompt: string;
  text: string;
  photoUrl?: string;
  referenceUrls: string[];
  aspectRatio?: '1:1' | '4:5' | '9:16' | '16:9';
  variants?: number;
}

export interface FalGenerateResult {
  imageUrls: string[];
  modelId: string;
  requestId: string;
  latencyMs: number;
}

export interface FalModelConfig {
  id: string;
  label: string;
  maxImages: number;
  maxReferenceImages: number;
  adapt: (
    input: FalGenerateInput,
    numImages: number,
  ) => Record<string, unknown>;
}

export const FalApiResponseSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.string(),
        width: z.number(),
        height: z.number(),
      }),
    )
    .min(1),
});

export type FalApiResponse = z.infer<typeof FalApiResponseSchema>;
