import { FalApiResponseSchema } from './fal.types';

// ─────────────────────────────────────────────
// FalApiResponseSchema
// ─────────────────────────────────────────────
describe('FalApiResponseSchema', () => {
  const validImage = {
    url: 'https://cdn.fal.ai/image.png',
    width: 1024,
    height: 1280,
  };

  it('parses a valid response with one image', () => {
    const result = FalApiResponseSchema.parse({ images: [validImage] });

    expect(result.images).toHaveLength(1);
    expect(result.images[0].url).toBe('https://cdn.fal.ai/image.png');
    expect(result.images[0].width).toBe(1024);
    expect(result.images[0].height).toBe(1280);
  });

  it('parses a valid response with multiple images', () => {
    const result = FalApiResponseSchema.parse({
      images: [
        validImage,
        { url: 'https://cdn.fal.ai/image2.png', width: 800, height: 1000 },
      ],
    });

    expect(result.images).toHaveLength(2);
  });

  it('fails when images field is missing', () => {
    expect(() => FalApiResponseSchema.parse({})).toThrow();
  });

  it('fails when images array is empty (min 1 constraint)', () => {
    expect(() => FalApiResponseSchema.parse({ images: [] })).toThrow();
  });

  it('fails when an image is missing url', () => {
    expect(() =>
      FalApiResponseSchema.parse({
        images: [{ width: 1024, height: 1280 }],
      }),
    ).toThrow();
  });

  it('fails when an image is missing width', () => {
    expect(() =>
      FalApiResponseSchema.parse({
        images: [{ url: 'https://cdn.fal.ai/image.png', height: 1280 }],
      }),
    ).toThrow();
  });

  it('fails when an image is missing height', () => {
    expect(() =>
      FalApiResponseSchema.parse({
        images: [{ url: 'https://cdn.fal.ai/image.png', width: 1024 }],
      }),
    ).toThrow();
  });

  it('fails when width is not a number', () => {
    expect(() =>
      FalApiResponseSchema.parse({
        images: [
          { url: 'https://cdn.fal.ai/image.png', width: '1024', height: 1280 },
        ],
      }),
    ).toThrow();
  });

  it('fails when images is not an array', () => {
    expect(() => FalApiResponseSchema.parse({ images: validImage })).toThrow();
  });
});
