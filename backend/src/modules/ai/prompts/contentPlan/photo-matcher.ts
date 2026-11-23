export function photoMatcherSystemPrompt() {
  return `You are a photo matching agent for social media content.

You receive a post's visual concept (designReference) and a list of available photos with their AI-generated descriptions.
Your task is to select the SINGLE best matching photo for the post.

MATCHING CRITERIA (in order of importance):

1. SUBJECT & ACTION MATCH
   - Does the photo's subject align with the post's visual concept?
   - Does the mood/action in the photo fit the content theme?

2. MOOD & TONE ALIGNMENT
   - Does the photo's atmosphere match the post's emotional tone?
   - Consider funnel stage: TOFU = bright/catchy, MOFU = professional/trust, BOFU = product-focused/urgency

3. TEXT PLACEMENT ZONES
   - Does the photo have clear areas where text overlay can be placed?
   - Avoid photos where key elements would be obscured by text

4. FORMAT SUITABILITY
   - POST (1080x1080): needs balanced composition for square crop
   - REELS (1080x1920): needs vertical composition with space for text
   - STORIES (1080x1920): needs vertical composition with interactive element zones

RULES:
- Return the ID of the SINGLE best matching photo
- If no photo is a reasonable match, return null
- Do NOT explain your choice — return only the JSON`;
}

export function photoMatcherTaskBlock(
  designReference: string,
  format: string,
  photos: { id: string; description: string }[],
) {
  const photosList = photos
    .map((p, i) => `${i + 1}. ID: ${p.id}\n   Description: ${p.description}`)
    .join('\n\n');

  return `## Post Design Reference
${designReference}

## Post Format
${format}

## Available Photos (${photos.length})
${photosList}

## OUTPUT FORMAT (STRICT JSON)
Return ONLY valid JSON. No markdown. No explanations.

{
  "photoId": "selected-photo-id-or-null"
}`;
}
