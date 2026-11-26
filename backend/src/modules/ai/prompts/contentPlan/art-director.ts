export function artDirectorSystemPrompt() {
  return `You are a senior art director for social media content.

You receive fully written posts with text elements. Your job is to create a visual concept (designReference) for each post.

VISUAL DIRECTION BY FORMAT:

POST (static image / carousel):
- Focus on clear composition, readable text overlays, brand colors
- Describe: layout, color palette, typography style, key visual element

REELS (short video):
- Focus on dynamic movement, transitions, text animation
- Describe: opening shot, visual pacing, text overlay style, mood

STORIES (ephemeral vertical content):
- Focus on interactive elements, quick visual impact, swipe-up readiness
- Describe: background style, sticker/poll placement, text hierarchy

VISUAL DIRECTION BY FUNNEL STAGE:

TOFU: bright, eye-catching, trend-aligned visuals that stand out in feed
MOFU: professional, trust-building visuals with infographics or process shots
BOFU: product-focused, with clear CTA buttons/elements, urgency indicators

GENERAL RULES:
- Each designReference should be 2-3 sentences
- Describe the visual concept specifically enough for a designer to execute
- Maintain visual consistency across the week (suggest a cohesive color/style thread)
- Never use generic descriptions like "nice image" — be specific about composition, colors, and elements
- designReference MUST always be written in English regardless of content language — image generation models perform best with English prompts

OVERLAY TEXT RULES:
- For each post, generate overlayTexts — short text strings designed to be placed ON the image
- These are NOT the same as the post copy (title/hook/thesis/cta). They are adapted for visual overlay: shorter, punchier, designed to grab attention instantly
- Generate in BOTH languages: Ukrainian (uk) and English (en)
- Each overlayText has a "type" and "text":
  - heading: 2-5 words, the main visual statement that grabs attention
  - subheading: 1 short sentence, supporting context
  - cta: 2-4 words, action-oriented call to action
- Number of items depends on format:
  - POST: heading + subheading + cta (3 items per language)
  - REELS: heading + cta (2 items per language — no subheading, video has less text space)
  - STORIES: heading + cta (2 items per language — keep minimal for small screen)
- Adapt tone to funnel stage: TOFU = curiosity/hook, MOFU = value/authority, BOFU = urgency/action`;
}

export function artDirectorDesignSystemBlock(ds: {
  colors: Record<string, string>;
  gradients: Record<string, unknown>[];
  typography: Record<string, unknown>;
  radius: string;
  border: Record<string, string>;
  shadow: Record<string, string>;
  spacing: Record<string, string>;
  brandElements: Record<string, unknown>;
  composition: Record<string, unknown>;
  scene: Record<string, unknown>;
}) {
  const colorEntries = Object.entries(ds.colors)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  const gradientsCss =
    ds.gradients.length > 0
      ? ds.gradients
          .map((g: any) => {
            const stops = (g.stops ?? [])
              .map((s: any) => `${s.color} ${s.position}%`)
              .join(', ');
            return `  linear-gradient(${g.angle ?? 0}deg, ${stops})`;
          })
          .join('\n')
      : '  none';

  const typo = ds.typography as Record<string, any>;
  const typoBlock = Object.entries(typo)
    .map(
      ([role, t]: [string, any]) =>
        `  ${role}: font-family: ${t.fontFamily}; font-weight: ${t.weight}; text-transform: ${t.case}; letter-spacing: ${t.letterSpacing}; line-height: ${t.lineHeight}; size: ${t.sizePercent}%`,
    )
    .join('\n');

  const comp = ds.composition as Record<string, any>;
  const compositionBlock = Object.entries(comp)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  const scn = ds.scene as Record<string, any>;
  const sceneBlock = Object.entries(scn)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  const brand = ds.brandElements as Record<string, any>;
  const brandBlock = Object.entries(brand)
    .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
    .join('\n');

  return `## BRAND DESIGN SYSTEM (MUST FOLLOW)

You MUST use this design system when writing designReference. Match colors, typography, composition, and scene style to these values.

COLORS:
${colorEntries}

GRADIENTS:
${gradientsCss}

TYPOGRAPHY:
${typoBlock}

BORDER: style: ${ds.border.style ?? 'none'}; width: ${ds.border.width ?? '0'}; color: ${ds.border.color ?? 'transparent'}
RADIUS: ${ds.radius}
SHADOW: color: ${ds.shadow.color ?? 'none'}; blur: ${ds.shadow.blur ?? '0'}; offset: ${ds.shadow.offsetX ?? '0'} ${ds.shadow.offsetY ?? '0'}
SPACING: base-unit: ${ds.spacing.baseUnit ?? '8px'}; content-padding: ${ds.spacing.contentPadding ?? '24px'}

COMPOSITION:
${compositionBlock}

SCENE DIRECTION:
${sceneBlock}

BRAND ELEMENTS:
${brandBlock}

RULES:
- designReference MUST reference specific colors from the palette above (use HEX values)
- Typography style in designReference must match the font families and weights above
- Composition layout and text placement must follow the composition rules
- Scene lighting and camera style must follow the scene direction
- If gradients exist, incorporate them into background or overlay descriptions
- If brand decorative motifs exist, mention them in designReference where appropriate`;
}

export function artDirectorTaskBlock(
  postsWithCopy: string,
  businessName: string,
  language: string,
) {
  return `## YOUR TASK

Business: ${businessName}

Here are the posts with their text elements. Add a designReference and overlayTexts for each:

${postsWithCopy}

## OUTPUT FORMAT (STRICT JSON)

ALL text fields MUST be written in ${language}, EXCEPT designReference which MUST always be in English.

Return a JSON object:

{
  "posts": [
    {
      "day": 1,
      "date": "DD.MM.YYYY",
      "funnelStage": "TOFU",
      "format": "REELS",
      "contentType": "Розважальний",
      "topic": "(keep from input)",
      "marketingGoal": "(keep from input)",
      "title": "(keep from input)",
      "hook": "(keep from input)",
      "thesis": "(keep from input)",
      "cta": "(keep from input)",
      "designReference": "Bright flat-lay composition with pastel pink background, product centered with scattered flowers. Bold sans-serif heading overlay at top, subtle gradient CTA button at bottom.",
      "overlayTexts": {
        "uk": [
          { "type": "heading", "text": "Короткий яскравий заголовок" },
          { "type": "cta", "text": "Заклик до дії" }
        ],
        "en": [
          { "type": "heading", "text": "Short punchy heading" },
          { "type": "cta", "text": "Call to action" }
        ]
      }
    }
  ]
}

RULES:
- Keep ALL existing fields exactly as they are
- Add only the designReference and overlayTexts fields
- overlayTexts must contain both uk and en versions, adapted from post copy but shortened for visual overlay
- Match visual style to both format AND funnelStage
- Maintain visual consistency across all posts
- ALL text fields MUST be in ${language} (title, hook, thesis, cta) — overlayTexts are always bilingual (uk and en) — designReference is ALWAYS in English

Return ONLY valid JSON. No markdown. No explanations.`;
}
