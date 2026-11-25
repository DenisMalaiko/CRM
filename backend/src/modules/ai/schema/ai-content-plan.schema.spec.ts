import {
  OverlayTextSchema,
  OverlayTextsSchema,
  ContentPlanPostSchema,
} from './ai-content-plan.schema';

// ─────────────────────────────────────────────
// OverlayTextSchema
// ─────────────────────────────────────────────
describe('OverlayTextSchema', () => {
  it('parses a valid heading overlay text', () => {
    const result = OverlayTextSchema.parse({
      type: 'heading',
      text: 'Bold Statement',
    });

    expect(result.type).toBe('heading');
    expect(result.text).toBe('Bold Statement');
  });

  it('parses a valid subheading overlay text', () => {
    const result = OverlayTextSchema.parse({
      type: 'subheading',
      text: 'Supporting context here',
    });

    expect(result.type).toBe('subheading');
  });

  it('parses a valid cta overlay text', () => {
    const result = OverlayTextSchema.parse({ type: 'cta', text: 'Buy Now' });

    expect(result.type).toBe('cta');
  });

  it('fails validation when type is not in the allowed enum', () => {
    expect(() =>
      OverlayTextSchema.parse({ type: 'body', text: 'Some text' }),
    ).toThrow();
  });

  it('fails validation when type is an empty string', () => {
    expect(() =>
      OverlayTextSchema.parse({ type: '', text: 'Some text' }),
    ).toThrow();
  });

  it('fails validation when text field is missing', () => {
    expect(() => OverlayTextSchema.parse({ type: 'heading' })).toThrow();
  });

  it('fails validation when type field is missing', () => {
    expect(() => OverlayTextSchema.parse({ text: 'Some text' })).toThrow();
  });
});

// ─────────────────────────────────────────────
// OverlayTextsSchema
// ─────────────────────────────────────────────
describe('OverlayTextsSchema', () => {
  const validOverlayTexts = {
    uk: [
      { type: 'heading', text: 'Заголовок' },
      { type: 'cta', text: 'Дізнатись більше' },
    ],
    en: [
      { type: 'heading', text: 'Heading' },
      { type: 'cta', text: 'Learn More' },
    ],
  };

  it('parses a valid bilingual overlayTexts object', () => {
    const result = OverlayTextsSchema.parse(validOverlayTexts);

    expect(result.uk).toHaveLength(2);
    expect(result.en).toHaveLength(2);
  });

  it('parses when both uk and en arrays are empty', () => {
    const result = OverlayTextsSchema.parse({ uk: [], en: [] });

    expect(result.uk).toEqual([]);
    expect(result.en).toEqual([]);
  });

  it('parses when uk has all three text types', () => {
    const result = OverlayTextsSchema.parse({
      uk: [
        { type: 'heading', text: 'Заголовок' },
        { type: 'subheading', text: 'Підзаголовок' },
        { type: 'cta', text: 'Дія' },
      ],
      en: [],
    });

    expect(result.uk).toHaveLength(3);
  });

  it('fails validation when uk field is missing', () => {
    expect(() => OverlayTextsSchema.parse({ en: [] })).toThrow();
  });

  it('fails validation when en field is missing', () => {
    expect(() => OverlayTextsSchema.parse({ uk: [] })).toThrow();
  });

  it('fails validation when a nested item has an invalid type enum', () => {
    expect(() =>
      OverlayTextsSchema.parse({
        uk: [{ type: 'caption', text: 'Invalid type' }],
        en: [],
      }),
    ).toThrow();
  });

  it('fails validation when a nested item is missing the text field', () => {
    expect(() =>
      OverlayTextsSchema.parse({
        uk: [{ type: 'heading' }],
        en: [],
      }),
    ).toThrow();
  });
});

// ─────────────────────────────────────────────
// ContentPlanPostSchema — overlayTexts field
// ─────────────────────────────────────────────
describe('ContentPlanPostSchema — overlayTexts', () => {
  const basePost = {
    day: 1,
    date: '25.11.2026',
    funnelStage: 'TOFU' as const,
    format: 'POST',
    contentType: 'Розважальний',
    topic: 'Brand story',
    marketingGoal: 'Awareness',
    title: 'Title',
    hook: 'Hook',
    thesis: 'Thesis',
    cta: 'CTA',
    designReference: 'Visual concept description here.',
  };

  it('defaults overlayTexts to { uk: [], en: [] } when not provided', () => {
    const result = ContentPlanPostSchema.parse(basePost);

    expect(result.overlayTexts).toEqual({ uk: [], en: [] });
  });

  it('parses overlayTexts when explicitly provided', () => {
    const result = ContentPlanPostSchema.parse({
      ...basePost,
      overlayTexts: {
        uk: [{ type: 'heading', text: 'Заголовок' }],
        en: [{ type: 'heading', text: 'Heading' }],
      },
    });

    expect(result.overlayTexts.uk[0].text).toBe('Заголовок');
    expect(result.overlayTexts.en[0].text).toBe('Heading');
  });

  it('fails when overlayTexts contains an invalid type enum value', () => {
    expect(() =>
      ContentPlanPostSchema.parse({
        ...basePost,
        overlayTexts: {
          uk: [{ type: 'invalid', text: 'Text' }],
          en: [],
        },
      }),
    ).toThrow();
  });

  it('fails when overlayTexts is missing the en key', () => {
    expect(() =>
      ContentPlanPostSchema.parse({
        ...basePost,
        overlayTexts: {
          uk: [],
        },
      }),
    ).toThrow();
  });
});
