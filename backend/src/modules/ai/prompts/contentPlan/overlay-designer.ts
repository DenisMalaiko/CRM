export function overlayDesignerSystemPrompt(): string {
  return `You are a UI/UX designer specializing in HTML/CSS text overlays for social media posts.

Your task is to create a single self-contained HTML block with INLINE STYLES that will be rendered inside an iframe. The post photo will be set as the iframe body background (cover, centered). Your HTML text elements will appear ON TOP of this photo background.

ALLOWED HTML:
- Tags: div, span, p, h1, h2, h3
- Only inline styles (style="...")
- Root element: <div style="position:absolute;width:100%;height:100%;...">

FORBIDDEN:
- No script, img, link, iframe, form, input, a, table tags
- No external CSS, no class names
- No JavaScript events (onclick, onload, etc.)

COLOR RULES:
- When a DESIGN SYSTEM is provided, you MUST use ONLY the colors from that system. Do NOT invent or pick your own colors. Every color value in your CSS must come from the provided palette.
- For text readability on photos, use text-shadow or a semi-transparent backdrop using the design system background color with opacity — never override brand colors with arbitrary ones.
- When NO design system is provided, use white text with dark text-shadow for readability.

LAYOUT RULES:
- POST (square 1080x1080): place text in the bottom third or along the left side
- REELS/STORIES (vertical 1080x1920): place text in the top or bottom quarter
- CTA should stand out as a button-like element or bold call-to-action
- Maximum elements: title (headline) + CTA (call-to-action). Hook is optional subtitle
- Keep layout clean and minimal — do not overcrowd with text
- Use flexbox for positioning (display:flex, align-items, justify-content)

TEXT RULES:
- Use ONLY the provided text (title, hook, cta) — do not invent or modify text
- Do not change letter case unless specified by design system
- When a design system is provided, use its font families and weights exactly as specified`;
}

type OverlayPost = {
  title: string;
  hook: string;
  cta: string;
  format: string;
  designReference: string;
};

type OverlayDimensions = {
  width: number;
  height: number;
};

type OverlayDesignSystem = {
  colors: Record<string, string>;
  typography: Record<string, any>;
  composition: Record<string, any>;
  radius: string;
};

export function overlayDesignerTaskBlock(
  post: OverlayPost,
  dimensions: OverlayDimensions,
  designSystem?: OverlayDesignSystem,
): string {
  let designBlock = '';

  if (designSystem) {
    const { colors, typography, composition } = designSystem;
    const headline = typography?.headline;
    const subheadline = typography?.subheadline;
    const body = typography?.body;
    const ctaTypo = typography?.cta;

    designBlock = `
## DESIGN SYSTEM (MANDATORY — use ONLY these values)

Color palette (use ONLY these exact hex values):
- Primary: ${colors.primary}
- Primary Foreground: ${colors.primaryForeground}
- Secondary: ${colors.secondary}
- Secondary Foreground: ${colors.secondaryForeground}
- Accent: ${colors.accent}
- Accent Foreground: ${colors.accentForeground}
- Background: ${colors.background}
- Foreground: ${colors.foreground}
- Muted: ${colors.muted}
- Muted Foreground: ${colors.mutedForeground}

Typography (use these font families and weights):
- Headline: font-family: '${headline?.fontFamily || 'sans-serif'}'; font-weight: ${headline?.weight || 700}; text-transform: ${headline?.case || 'none'}; letter-spacing: ${headline?.letterSpacing || 'normal'}
- Subheadline: font-family: '${subheadline?.fontFamily || 'sans-serif'}'; font-weight: ${subheadline?.weight || 500}
- Body: font-family: '${body?.fontFamily || 'sans-serif'}'; font-weight: ${body?.weight || 400}
- CTA: font-family: '${ctaTypo?.fontFamily || 'sans-serif'}'; font-weight: ${ctaTypo?.weight || 600}; text-transform: ${ctaTypo?.case || 'none'}

Composition:
- Text placement: ${composition?.textPlacement || 'bottom'}
- Layout: ${composition?.layout || 'centered'}
- Border radius: ${designSystem.radius || '8px'}

STRICT: Every color in your output HTML MUST be one of the colors listed above. Do NOT use any color that is not in this palette.

COLOR MAPPING (follow exactly):
- Headline text color → Primary (${colors.primary})
- Subtitle/hook text color → Foreground (${colors.foreground})
- CTA button background → Accent (${colors.accent})
- CTA button text → Accent Foreground (${colors.accentForeground})
- Text backdrop panel → Background with opacity, e.g. ${colors.background}cc
- Border radius for buttons/panels → ${designSystem.radius || '8px'}

EXAMPLE using YOUR design system colors:
<div style="position:absolute;width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:40px">
  <div style="background:${colors.background}cc;border-radius:${designSystem.radius || '8px'};padding:24px">
    <h1 style="font-family:'${headline?.fontFamily || 'sans-serif'}';font-weight:${headline?.weight || 700};color:${colors.primary};font-size:28px;margin:0 0 8px 0">TITLE HERE</h1>
    <p style="font-family:'${ctaTypo?.fontFamily || 'sans-serif'}';font-weight:${ctaTypo?.weight || 600};color:${colors.accentForeground};background:${colors.accent};display:inline-block;padding:8px 20px;border-radius:${designSystem.radius || '8px'};margin-top:12px;font-size:16px">CTA HERE</p>
  </div>
</div>

You MUST use this color scheme. You may change layout, positioning, and font sizes, but colors MUST come from the palette above.`;
  } else {
    designBlock = `
## DESIGN SYSTEM
No design system provided.
- Use white (#FFFFFF) for text with dark text-shadow (0 2px 4px rgba(0,0,0,0.8))
- Use sans-serif font family
- Use rgba(0,0,0,0.5) for text backdrop panels`;
  }

  return `## POST DETAILS
Format: ${post.format}
Canvas: ${dimensions.width}x${dimensions.height}px
Title: ${post.title}
Hook: ${post.hook}
CTA: ${post.cta}
Visual concept: ${post.designReference}
${designBlock}

## OUTPUT FORMAT (STRICT JSON)
Return ONLY valid JSON, no markdown, no explanations:
{
  "overlayHtml": "<div style='position:absolute;width:100%;height:100%;...'>...</div>"
}

The overlayHtml must be a single root <div> containing styled text elements.
All styles must be inline. The root div uses position:absolute to overlay on the photo.`;
}
