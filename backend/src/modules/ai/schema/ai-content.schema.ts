import { z } from "zod";

const ImagePromptSchema = z.object({
  scene: z.string().optional().default(''),
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  caption: z.string().optional().default(''),
  userPrompt: z.string().optional().default(''),
}).passthrough();

const AiPostSchema = z.object({
  platform: z.string().optional().default(''),
  hook: z.string().optional().default(''),
  body: z.string().optional().default(''),
  cta: z.string().optional().default(''),
  emotional_angle: z.string().optional().default(''),
  image_prompt: ImagePromptSchema.default({ scene: '', title: '', subtitle: '', caption: '', userPrompt: '' }),
  imageUrl: z.string().optional().default(''),
});

export const PostsResponseSchema = z.object({
  posts: z.array(AiPostSchema).default([]),
}).passthrough();

export const StoriesResponseSchema = z.object({
  stories: z.array(AiPostSchema).default([]),
}).passthrough();

export const NormalizedPromptSchema = z.object({
  text: z.array(z.string()).default([]),
  image: z.array(z.string()).default([]),
}).passthrough();
