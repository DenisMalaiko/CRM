export type TColorToken = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  ring: string;
};

export type TGradientStop = {
  color: string;
  position: number;
};

export type TGradient = {
  type: 'linear' | 'radial';
  angle: number;
  stops: TGradientStop[];
};

export type TTypographyLevel = {
  fontFamily: string;
  fontClassification: string;
  weight: number;
  case: string;
  letterSpacing: string;
  lineHeight: number;
  sizePercent: number;
};

export type TTypography = {
  headline: TTypographyLevel;
  subheadline: TTypographyLevel;
  body: TTypographyLevel;
  cta: TTypographyLevel;
};

export type TBorder = {
  style: string;
  width: string;
  color: string;
};

export type TShadow = {
  color: string;
  blur: string;
  spread: string;
  offsetX: string;
  offsetY: string;
};

export type TSpacing = {
  baseUnit: string;
  contentPadding: string;
};

export type TGraphicElement = {
  type: string;
  color: string;
  opacity: number;
  angle: number;
};

export type TBrandElements = {
  logoStyle: string;
  decorativeMotifs: string[];
  graphicElements: TGraphicElement[];
};

export type TComposition = {
  layout: string;
  textPlacement: string;
  dominantPattern: string;
  negativeSpacePercent: number;
  visualHierarchy: string;
};

export type TScene = {
  lighting: string;
  cameraLens: string;
  perspective: string;
  depthOfField: string;
  colorTemperatureK: number;
  environment: string;
};

export type TDesignSystem = {
  id: string;
  name: string;
  businessId: string | null;
  source: 'MANUAL' | 'AI_PHOTO' | 'PRESET';
  isPreset: boolean;
  colors: TColorToken;
  gradients: TGradient[];
  typography: TTypography;
  radius: string;
  border: TBorder;
  shadow: TShadow;
  spacing: TSpacing;
  brandElements: TBrandElements;
  composition: TComposition;
  scene: TScene;
  createdAt: Date;
  updatedAt: Date;
};
