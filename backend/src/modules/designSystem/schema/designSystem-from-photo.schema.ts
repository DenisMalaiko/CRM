import { z } from 'zod';

const DEFAULT_COLORS = {
  background: '#FFFFFF',
  foreground: '#111111',
  primary: '#1A1A1A',
  primaryForeground: '#FFFFFF',
  secondary: '#111111',
  secondaryForeground: '#111111',
  muted: '#FAFAFA',
  mutedForeground: '#737373',
  accent: '#1A1A1A',
  accentForeground: '#111111',
  destructive: '#1A1A1A',
  border: '#1A1A1A',
  ring: '#1A1A1A',
};

const DEFAULT_TYPOGRAPHY_HEADLINE = {
  fontFamily: 'Inter',
  fontClassification: 'sans-serif',
  weight: 600,
  case: 'sentence',
  letterSpacing: '0.02em',
  lineHeight: 1.1,
  sizePercent: 12,
};

const DEFAULT_TYPOGRAPHY_SUBHEADLINE = {
  fontFamily: 'Inter',
  fontClassification: 'sans-serif',
  weight: 400,
  case: 'sentence',
  letterSpacing: '0em',
  lineHeight: 1.3,
  sizePercent: 7,
};

const DEFAULT_TYPOGRAPHY_BODY = {
  fontFamily: 'Inter',
  fontClassification: 'sans-serif',
  weight: 400,
  case: 'sentence',
  letterSpacing: '0em',
  lineHeight: 1.5,
  sizePercent: 5,
};

const DEFAULT_TYPOGRAPHY_CTA = {
  fontFamily: 'Inter',
  fontClassification: 'sans-serif',
  weight: 600,
  case: 'uppercase',
  letterSpacing: '0.05em',
  lineHeight: 1.2,
  sizePercent: 5,
};

const DEFAULT_BORDER = { style: 'solid', width: '1px', color: '#E5E5E5' };

const DEFAULT_SHADOW = {
  color: 'rgba(0,0,0,0.05)',
  blur: '6px',
  spread: '0px',
  offsetX: '0px',
  offsetY: '2px',
};

const DEFAULT_SPACING = { baseUnit: '8px', contentPadding: '24px' };

const DEFAULT_BRAND_ELEMENTS = {
  logoStyle: 'minimal',
  decorativeMotifs: [] as string[],
  graphicElements: [] as Array<{
    type: string;
    color: string;
    opacity: number;
    angle: number;
  }>,
};

const DEFAULT_COMPOSITION = {
  layout: 'full-bleed',
  textPlacement: 'overlay',
  dominantPattern: 'centered',
  negativeSpacePercent: 40,
  visualHierarchy: 'headline-first',
};

const DEFAULT_SCENE = {
  lighting: 'soft diffused natural light, no harsh shadows, neutral tones',
  cameraLens: '50mm f/2.8',
  perspective: 'eye-level',
  depthOfField: 'medium f/4',
  colorTemperatureK: 5500,
  environment: 'studio',
};

const ColorTokenSchema = z.object({
  background: z.string().optional().default('#FFFFFF'),
  foreground: z.string().optional().default('#111111'),
  primary: z.string().optional().default('#1A1A1A'),
  primaryForeground: z.string().optional().default('#FFFFFF'),
  secondary: z.string().optional().default('#111111'),
  secondaryForeground: z.string().optional().default('#111111'),
  muted: z.string().optional().default('#FAFAFA'),
  mutedForeground: z.string().optional().default('#737373'),
  accent: z.string().optional().default('#1A1A1A'),
  accentForeground: z.string().optional().default('#111111'),
  destructive: z.string().optional().default('#1A1A1A'),
  border: z.string().optional().default('#1A1A1A'),
  ring: z.string().optional().default('#1A1A1A'),
});

const GradientStopSchema = z.object({
  color: z.string(),
  position: z.number(),
});

const GradientSchema = z.object({
  type: z.enum(['linear', 'radial']).default('linear'),
  angle: z.number().default(135),
  stops: z.array(GradientStopSchema).default([]),
});

const TypographyLevelSchema = z.object({
  fontFamily: z.string().optional().default('Inter'),
  fontClassification: z.string().optional().default('sans-serif'),
  weight: z.number().optional().default(400),
  case: z.string().optional().default('sentence'),
  letterSpacing: z.string().optional().default('0em'),
  lineHeight: z.number().optional().default(1.3),
  sizePercent: z.number().optional().default(5),
});

const TypographySchema = z.object({
  headline: TypographyLevelSchema.default(DEFAULT_TYPOGRAPHY_HEADLINE),
  subheadline: TypographyLevelSchema.default(DEFAULT_TYPOGRAPHY_SUBHEADLINE),
  body: TypographyLevelSchema.default(DEFAULT_TYPOGRAPHY_BODY),
  cta: TypographyLevelSchema.default(DEFAULT_TYPOGRAPHY_CTA),
});

const BorderSchema = z.object({
  style: z.string().optional().default('solid'),
  width: z.string().optional().default('1px'),
  color: z.string().optional().default('#E5E5E5'),
});

const ShadowSchema = z.object({
  color: z.string().optional().default('rgba(0,0,0,0.05)'),
  blur: z.string().optional().default('6px'),
  spread: z.string().optional().default('0px'),
  offsetX: z.string().optional().default('0px'),
  offsetY: z.string().optional().default('2px'),
});

const SpacingSchema = z.object({
  baseUnit: z.string().optional().default('8px'),
  contentPadding: z.string().optional().default('24px'),
});

const GraphicElementSchema = z.object({
  type: z.string(),
  color: z.string(),
  opacity: z.number(),
  angle: z.number(),
});

const BrandElementsSchema = z.object({
  logoStyle: z.string().optional().default('minimal'),
  decorativeMotifs: z.array(z.string()).optional().default([]),
  graphicElements: z.array(GraphicElementSchema).optional().default([]),
});

const CompositionSchema = z.object({
  layout: z.string().optional().default('full-bleed'),
  textPlacement: z.string().optional().default('overlay'),
  dominantPattern: z.string().optional().default('centered'),
  negativeSpacePercent: z.number().optional().default(40),
  visualHierarchy: z.string().optional().default('headline-first'),
});

const SceneSchema = z.object({
  lighting: z
    .string()
    .optional()
    .default('soft diffused natural light, no harsh shadows, neutral tones'),
  cameraLens: z.string().optional().default('50mm f/2.8'),
  perspective: z.string().optional().default('eye-level'),
  depthOfField: z.string().optional().default('medium f/4'),
  colorTemperatureK: z.number().optional().default(5500),
  environment: z.string().optional().default('studio'),
});

export const DesignSystemFromPhotoSchema = z.object({
  colors: ColorTokenSchema.default(DEFAULT_COLORS),
  gradients: z.array(GradientSchema).default([]),
  typography: TypographySchema.default({
    headline: DEFAULT_TYPOGRAPHY_HEADLINE,
    subheadline: DEFAULT_TYPOGRAPHY_SUBHEADLINE,
    body: DEFAULT_TYPOGRAPHY_BODY,
    cta: DEFAULT_TYPOGRAPHY_CTA,
  }),
  radius: z.string().optional().default('8px'),
  border: BorderSchema.default(DEFAULT_BORDER),
  shadow: ShadowSchema.default(DEFAULT_SHADOW),
  spacing: SpacingSchema.default(DEFAULT_SPACING),
  brandElements: BrandElementsSchema.default(DEFAULT_BRAND_ELEMENTS),
  composition: CompositionSchema.default(DEFAULT_COMPOSITION),
  scene: SceneSchema.default(DEFAULT_SCENE),
});

export type DesignSystemFromPhoto = z.infer<typeof DesignSystemFromPhotoSchema>;
