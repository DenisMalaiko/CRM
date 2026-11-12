export function buildDesignSystemFromPhotoPrompt(): string {
  return `You are an expert design system analyst and brand identity specialist.

Analyze the uploaded image and extract a complete design system. The image may be a website screenshot, brand material, advertisement, product photo, or any visual reference.

Extract the following design tokens and return them as a single JSON object.

## COLORS (all as hex #RRGGBB)

These color tokens map to specific UI elements in a marketing creative:
- background: canvas/card background color
- foreground: headline word 2 color (secondary headline text)
- primary: headline word 1 color (primary headline text)
- primaryForeground: button text color
- secondary: description/body text color
- secondaryForeground: list item text color
- muted: list/card background color
- mutedForeground: subheadline word 2 color
- accent: canvas accent line color
- accentForeground: subheadline word 1 color
- destructive: list bullet/marker color
- border: button background color
- ring: focus ring color (often matches primary)

## GRADIENTS

If gradients are visible, extract them as an array. Each gradient:
- type: "linear" or "radial"
- angle: degrees (0-360)
- stops: array of { color: "#RRGGBB", position: 0-100 }
If no gradients are visible, return an empty array.

## TYPOGRAPHY

The design system uses TWO font families: one for headlines/CTA and one for body/subheadline text.
Analyze the image to determine the visual style and pick the best matching fonts from the ALLOWED list below.

ALLOWED FONTS (you MUST pick ONLY from this list):
Sans-serif: "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Nunito", "Oswald", "Source Sans 3", "PT Sans", "Fira Sans", "Work Sans", "DM Sans", "Space Grotesk"
Serif: "Playfair Display", "Merriweather", "Bitter", "Crimson Text", "Libre Baskerville", "Lora"

Font matching guide:
- Thin/geometric sans-serif → "Inter", "DM Sans", or "Space Grotesk"
- Rounded/friendly sans-serif → "Nunito", "Poppins", or "Raleway"
- Strong/bold sans-serif → "Montserrat", "Oswald", or "Work Sans"
- Classic/neutral sans-serif → "Roboto", "Open Sans", or "Lato"
- Elegant/display serif → "Playfair Display" or "Crimson Text"
- Readable/body serif → "Merriweather", "Lora", or "Libre Baskerville"
- Modern serif → "Bitter"

Typography is split into 4 levels. Typically headlines and CTA share one font, while subheadline and body share another:
- headline: the main headline font (usually bolder, can be display/serif)
- subheadline: secondary heading font (usually the body font family)
- body: paragraph/description font (usually a clean readable sans-serif)
- cta: call-to-action button font (usually matches headline font)

For each level provide:
- fontFamily: MUST be from the allowed list above
- fontClassification: "serif" or "sans-serif" (matching the chosen font)
- weight: 100-900 (e.g. 400 for regular, 500 for medium, 600 for semibold, 700 for bold)
- case: "uppercase", "lowercase", "title", or "sentence"
- letterSpacing: CSS value like "0.02em", "0.05em", or "0em"
- lineHeight: number like 1.1 (tight) or 1.5 (relaxed)
- sizePercent: relative size (headline ~12, subheadline ~7, body ~5, cta ~5)

## RADIUS

Border radius as CSS value (e.g. "8px", "12px", "0px" for sharp corners, "9999px" for pill).

## BORDER

- style: "solid", "dashed", or "none"
- width: CSS value (e.g. "1px", "2px")
- color: hex color

## SHADOW

- color: rgba value (e.g. "rgba(0,0,0,0.1)")
- blur: CSS value (e.g. "6px", "12px")
- spread: CSS value (e.g. "0px")
- offsetX: CSS value (e.g. "0px")
- offsetY: CSS value (e.g. "2px", "4px")

## SPACING

- baseUnit: base spacing unit (e.g. "8px", "4px")
- contentPadding: main content padding (e.g. "24px", "32px")

## BRAND ELEMENTS

- logoStyle: "minimal", "detailed", "icon-only", or "wordmark"
- decorativeMotifs: array of descriptive strings (e.g. ["geometric lines", "organic curves"])
- graphicElements: array of { type: string, color: "#RRGGBB", opacity: 0-1, angle: 0-360 }

## COMPOSITION

- layout: "full-bleed", "center", or "split"
- textPlacement: "overlay", "floating", "sidebar", or "bottom-bar"
- dominantPattern: "centered", "rule-of-thirds", or "asymmetric"
- negativeSpacePercent: 0-100 (estimate of empty space)
- visualHierarchy: "headline-first", "image-first", or "balanced"

## SCENE

- lighting: descriptive string (e.g. "warm golden hour light with soft shadows")
- cameraLens: e.g. "50mm f/2.8", "35mm f/1.4", "85mm f/1.8"
- perspective: "eye-level", "low-angle", "high-angle", or "bird-eye"
- depthOfField: e.g. "shallow f/1.8", "medium f/4", "deep f/8"
- colorTemperatureK: Kelvin value (3000=warm, 5500=neutral, 7000=cool)
- environment: "studio", "outdoor", "office", "home", "urban", "nature"

Return ONLY a valid JSON object with all the fields above. Do not include any explanation or markdown formatting.`;
}
