import { FAL_MODEL_CHAIN, FAL_PREVIEW_MODEL } from './fal-models.config';
import { FalGenerateInput } from './fal.types';

const baseInput: FalGenerateInput = {
  prompt: 'A product on a white background',
  text: 'Buy Now',
  referenceUrls: [],
  aspectRatio: '4:5',
};

// ─────────────────────────────────────────────
// FAL_MODEL_CHAIN structure
// ─────────────────────────────────────────────
describe('FAL_MODEL_CHAIN', () => {
  it('contains exactly 5 models', () => {
    expect(FAL_MODEL_CHAIN).toHaveLength(5);
  });

  it('every model has id, label, maxImages, maxReferenceImages, and adapt', () => {
    for (const model of FAL_MODEL_CHAIN) {
      expect(typeof model.id).toBe('string');
      expect(typeof model.label).toBe('string');
      expect(typeof model.maxImages).toBe('number');
      expect(typeof model.maxReferenceImages).toBe('number');
      expect(typeof model.adapt).toBe('function');
    }
  });
});

// ─────────────────────────────────────────────
// FAL_PREVIEW_MODEL
// ─────────────────────────────────────────────
describe('FAL_PREVIEW_MODEL', () => {
  it('is the model at index 3 (Flare)', () => {
    expect(FAL_PREVIEW_MODEL).toBe(FAL_MODEL_CHAIN[3]);
  });

  it('has label "Flare"', () => {
    expect(FAL_PREVIEW_MODEL.label).toBe('Flare');
  });
});

// ─────────────────────────────────────────────
// adaptOpenAI adapter (Sunburst — index 0)
// ─────────────────────────────────────────────
describe('adaptOpenAI (Sunburst)', () => {
  const model = FAL_MODEL_CHAIN[0];

  it('output has prompt, image_urls, image_size, quality, num_images', () => {
    const result = model.adapt(baseInput, 1);

    expect(result).toHaveProperty('prompt');
    expect(result).toHaveProperty('image_urls');
    expect(result).toHaveProperty('image_size');
    expect(result).toHaveProperty('quality');
    expect(result).toHaveProperty('num_images');
  });

  it('quality is "high"', () => {
    const result = model.adapt(baseInput, 1);

    expect(result.quality).toBe('high');
  });

  it('num_images reflects the requested count', () => {
    const result = model.adapt(baseInput, 1);

    expect(result.num_images).toBe(1);
  });

  it('maps aspectRatio 4:5 to portrait_4_3', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '4:5' }, 1);

    expect(result.image_size).toBe('portrait_4_3');
  });

  it('maps aspectRatio 1:1 to square', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '1:1' }, 1);

    expect(result.image_size).toBe('square');
  });

  it('maps aspectRatio 9:16 to portrait_16_9', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '9:16' }, 1);

    expect(result.image_size).toBe('portrait_16_9');
  });

  it('maps aspectRatio 16:9 to landscape_16_9', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '16:9' }, 1);

    expect(result.image_size).toBe('landscape_16_9');
  });

  it('defaults to portrait_4_3 when aspectRatio is undefined', () => {
    const input: FalGenerateInput = { ...baseInput, aspectRatio: undefined };
    const result = model.adapt(input, 1);

    expect(result.image_size).toBe('portrait_4_3');
  });
});

// ─────────────────────────────────────────────
// adaptSeedream adapter (Seedream v5.5 — index 1)
// ─────────────────────────────────────────────
describe('adaptSeedream (Seedream v5.5)', () => {
  const model = FAL_MODEL_CHAIN[1];

  it('output has prompt, image_urls, and image_size', () => {
    const result = model.adapt(baseInput, 2);

    expect(result).toHaveProperty('prompt');
    expect(result).toHaveProperty('image_urls');
    expect(result).toHaveProperty('image_size');
  });

  it('image_size is always "auto_2K"', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '16:9' }, 2);

    expect(result.image_size).toBe('auto_2K');
  });

  it('caps num_images at 6', () => {
    const result = model.adapt(baseInput, 10);

    expect(result.num_images).toBe(6);
  });
});

// ─────────────────────────────────────────────
// adaptNanoBanana adapter (Nano Banana 2.1 — index 2)
// ─────────────────────────────────────────────
describe('adaptNanoBanana (Nano Banana 2.1)', () => {
  const model = FAL_MODEL_CHAIN[2];

  it('output has prompt, aspect_ratio, resolution, and reasoning_effort', () => {
    const result = model.adapt(baseInput, 1);

    expect(result).toHaveProperty('prompt');
    expect(result).toHaveProperty('aspect_ratio');
    expect(result).toHaveProperty('resolution');
    expect(result).toHaveProperty('reasoning_effort');
  });

  it('reasoning_effort is "high"', () => {
    const result = model.adapt(baseInput, 1);

    expect(result.reasoning_effort).toBe('high');
  });

  it('caps num_images at 4', () => {
    const result = model.adapt(baseInput, 10);

    expect(result.num_images).toBe(4);
  });

  it('maps 4:5 to aspect_ratio "4:5" and resolution "896x1120"', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '4:5' }, 1);

    expect(result.aspect_ratio).toBe('4:5');
    expect(result.resolution).toBe('896x1120');
  });

  it('maps 9:16 to aspect_ratio "9:16" and resolution "768x1344"', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '9:16' }, 1);

    expect(result.aspect_ratio).toBe('9:16');
    expect(result.resolution).toBe('768x1344');
  });

  it('maps 16:9 to aspect_ratio "16:9" and resolution "1344x768"', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '16:9' }, 1);

    expect(result.aspect_ratio).toBe('16:9');
    expect(result.resolution).toBe('1344x768');
  });

  it('maps 1:1 to aspect_ratio "1:1" and resolution "1024x1024"', () => {
    const result = model.adapt({ ...baseInput, aspectRatio: '1:1' }, 1);

    expect(result.aspect_ratio).toBe('1:1');
    expect(result.resolution).toBe('1024x1024');
  });

  it('omits image_urls when referenceUrls is empty and no photoUrl', () => {
    const input: FalGenerateInput = {
      ...baseInput,
      referenceUrls: [],
      photoUrl: undefined,
    };
    const result = model.adapt(input, 1);

    expect(result).not.toHaveProperty('image_urls');
  });

  it('includes image_urls when referenceUrls are provided', () => {
    const input: FalGenerateInput = {
      ...baseInput,
      referenceUrls: ['https://example.com/ref.jpg'],
    };
    const result = model.adapt(input, 1);

    expect(result).toHaveProperty('image_urls');
  });
});

// ─────────────────────────────────────────────
// adaptSeedreamLite adapter (Seedream v5 Lite — index 4)
// ─────────────────────────────────────────────
describe('adaptSeedreamLite (Seedream v5 Lite)', () => {
  const model = FAL_MODEL_CHAIN[4];

  it('output has prompt, image_urls, and image_size', () => {
    const result = model.adapt(baseInput, 2);

    expect(result).toHaveProperty('prompt');
    expect(result).toHaveProperty('image_urls');
    expect(result).toHaveProperty('image_size');
  });

  it('image_size is always "auto_2K"', () => {
    const result = model.adapt(baseInput, 2);

    expect(result.image_size).toBe('auto_2K');
  });

  it('caps num_images at 6', () => {
    const result = model.adapt(baseInput, 10);

    expect(result.num_images).toBe(6);
  });
});

// ─────────────────────────────────────────────
// buildImageUrls behavior — via adapter outputs
// ─────────────────────────────────────────────
describe('buildImageUrls ordering and truncation', () => {
  const openAIModel = FAL_MODEL_CHAIN[0]; // max 16 reference images
  const nanoBananaModel = FAL_MODEL_CHAIN[2]; // max 4 reference images

  it('photoUrl appears first in image_urls, then referenceUrls', () => {
    const input: FalGenerateInput = {
      ...baseInput,
      photoUrl: 'https://example.com/photo.jpg',
      referenceUrls: [
        'https://example.com/ref1.jpg',
        'https://example.com/ref2.jpg',
      ],
    };

    const result = openAIModel.adapt(input, 1);
    const urls = result.image_urls as string[];

    expect(urls[0]).toBe('https://example.com/photo.jpg');
    expect(urls[1]).toBe('https://example.com/ref1.jpg');
    expect(urls[2]).toBe('https://example.com/ref2.jpg');
  });

  it('only referenceUrls are present when photoUrl is absent', () => {
    const input: FalGenerateInput = {
      ...baseInput,
      photoUrl: undefined,
      referenceUrls: [
        'https://example.com/ref1.jpg',
        'https://example.com/ref2.jpg',
      ],
    };

    const result = openAIModel.adapt(input, 1);
    const urls = result.image_urls as string[];

    expect(urls).toEqual([
      'https://example.com/ref1.jpg',
      'https://example.com/ref2.jpg',
    ]);
  });

  it('truncates to model max when total urls exceed the limit', () => {
    const input: FalGenerateInput = {
      ...baseInput,
      photoUrl: 'https://example.com/photo.jpg',
      referenceUrls: Array.from(
        { length: 10 },
        (_, i) => `https://example.com/ref${i}.jpg`,
      ),
    };

    // NanoBanana has max 4
    const result = nanoBananaModel.adapt(input, 1);
    const urls = result.image_urls as string[];

    expect(urls).toHaveLength(4);
    expect(urls[0]).toBe('https://example.com/photo.jpg');
  });

  it('image_urls is empty array when no photoUrl and no referenceUrls (OpenAI adapter)', () => {
    const input: FalGenerateInput = {
      ...baseInput,
      photoUrl: undefined,
      referenceUrls: [],
    };

    const result = openAIModel.adapt(input, 1);
    const urls = result.image_urls as string[];

    expect(urls).toEqual([]);
  });
});
