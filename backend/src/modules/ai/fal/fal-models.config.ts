import { FalModelConfig, FalGenerateInput } from './fal.types';

function buildPrompt(input: FalGenerateInput): string {
  if (!input.text) return input.prompt;
  return `${input.prompt}\n\nText to render on the image (exact wording): "${input.text}"`;
}

function buildImageUrls(input: FalGenerateInput, max: number): string[] {
  const urls: string[] = [];
  if (input.photoUrl) urls.push(input.photoUrl);
  urls.push(...input.referenceUrls);
  return urls.slice(0, max);
}

function mapAspectToImageSize(aspect?: string): string {
  const mapping: Record<string, string> = {
    '1:1': 'square',
    '4:5': 'portrait_4_3',
    '9:16': 'portrait_16_9',
    '16:9': 'landscape_16_9',
  };
  return mapping[aspect ?? '4:5'] ?? 'portrait_4_3';
}

function adaptOpenAI(
  input: FalGenerateInput,
  numImages: number,
): Record<string, unknown> {
  return {
    prompt: buildPrompt(input),
    image_urls: buildImageUrls(input, 16),
    image_size: mapAspectToImageSize(input.aspectRatio),
    quality: 'high',
    num_images: numImages,
    output_format: 'png',
  };
}

function adaptNanoBanana(
  input: FalGenerateInput,
  numImages: number,
): Record<string, unknown> {
  const aspectMap: Record<
    string,
    { aspect_ratio: string; resolution: string }
  > = {
    '1:1': { aspect_ratio: '1:1', resolution: '1024x1024' },
    '4:5': { aspect_ratio: '4:5', resolution: '896x1120' },
    '9:16': { aspect_ratio: '9:16', resolution: '768x1344' },
    '16:9': { aspect_ratio: '16:9', resolution: '1344x768' },
  };
  const dims = aspectMap[input.aspectRatio ?? '4:5'] ?? aspectMap['4:5'];
  const imageUrls = buildImageUrls(input, 4);

  return {
    prompt: buildPrompt(input),
    ...(imageUrls.length > 0 && { image_urls: imageUrls }),
    aspect_ratio: dims.aspect_ratio,
    resolution: dims.resolution,
    num_images: Math.min(numImages, 4),
    reasoning_effort: 'high',
  };
}

function adaptSeedreamLite(
  input: FalGenerateInput,
  numImages: number,
): Record<string, unknown> {
  return {
    prompt: buildPrompt(input),
    image_urls: buildImageUrls(input, 10),
    image_size: 'auto_2K',
    num_images: Math.min(numImages, 6),
    output_format: 'png',
  };
}

export const FAL_MODEL_CHAIN: FalModelConfig[] = [
  {
    id: 'openai/gpt-image-2.6/sunburst/edit',
    label: 'Sunburst',
    maxImages: 1,
    maxReferenceImages: 16,
    adapt: adaptOpenAI,
  },
  {
    id: 'google/nano-banana-2.1/edit',
    label: 'Nano Banana 2.1',
    maxImages: 4,
    maxReferenceImages: 4,
    adapt: adaptNanoBanana,
  },
  {
    id: 'openai/gpt-image-2.6/flare/edit',
    label: 'Flare',
    maxImages: 4,
    maxReferenceImages: 16,
    adapt: adaptOpenAI,
  },
  {
    id: 'fal-ai/bytedance/seedream/v5/lite/edit',
    label: 'Seedream v5 Lite',
    maxImages: 6,
    maxReferenceImages: 10,
    adapt: adaptSeedreamLite,
  },
];

export const FAL_PREVIEW_MODEL = FAL_MODEL_CHAIN[2]; // Flare
