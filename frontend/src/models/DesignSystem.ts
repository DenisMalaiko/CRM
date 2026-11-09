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

export type TGradient = {
  type: "linear" | "radial";
  angle: number;
  stops: { color: string; position: number }[];
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

export type TDesignSystem = {
  id: string;
  name: string;
  businessId: string | null;
  source: "MANUAL" | "AI_PHOTO" | "PRESET";
  isPreset: boolean;
  colors: TColorToken;
  gradients: TGradient[];
  typography: TTypography;
  radius: string;
  border: { style: string; width: string; color: string };
  shadow: {
    color: string;
    blur: string;
    spread: string;
    offsetX: string;
    offsetY: string;
  };
  spacing: { baseUnit: string; contentPadding: string };
  brandElements: {
    logoStyle: string;
    decorativeMotifs: string[];
    graphicElements: any[];
  };
  composition: {
    layout: string;
    textPlacement: string;
    dominantPattern: string;
    negativeSpacePercent: number;
    visualHierarchy: string;
  };
  scene: {
    lighting: string;
    cameraLens: string;
    perspective: string;
    depthOfField: string;
    colorTemperatureK: number;
    environment: string;
  };
  createdAt: string;
  updatedAt: string;
};
