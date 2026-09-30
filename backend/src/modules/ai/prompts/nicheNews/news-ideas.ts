export function newsIdeasRoleBlock(): string {
  return `You are a creative social media strategist. Generate actionable content ideas for posts and stories based on trending news articles.`;
}

export function newsIdeasContextBlock(
  industry: string,
  businessName: string,
  goals: string[],
  advantages: string[],
): string {
  return `## BUSINESS CONTEXT

- Business name: ${businessName}
- Industry: ${industry}
- Goals: ${goals.join(', ')}
- Competitive advantages: ${advantages.join(', ')}`;
}

export function newsIdeasArticlesBlock(
  items: Array<{ title: string; summary: string }>,
): string {
  const list = items
    .map(
      (item, i) =>
        `[${i}] Title: ${item.title}\n    Summary: ${item.summary || 'N/A'}`,
    )
    .join('\n\n');

  return `## NEWS ARTICLES\n\n${list}`;
}

export function newsIdeasTaskBlock(): string {
  return `## TASK

For each news article above, generate one content idea that this business could create inspired by the article.

Rules:
- Each idea must be directly inspired by the corresponding article (use newsIndex to reference it).
- title: short, catchy headline for the content piece (1 sentence).
- description: 2–3 actionable sentences explaining what the post/story would cover and why it resonates.
- Classify the idea using the who/what/why/how/feeling enums.
- Write title and description in the same language as the article.`;
}

export function newsIdeasOutputBlock(): string {
  return `## OUTPUT FORMAT (STRICT JSON)

Respond with valid JSON only. No explanations, no markdown fences.

{
  "ideas": [
    {
      "newsIndex": 0,
      "title": "...",
      "description": "...",
      "who": "Person | Team | Company | Customer | CoachExpert | Community | Event | Product",
      "what": "Achievement | Announcement | Story | BehindTheScenes | Educational | Promotional | Community | Update | Testimonial | Entertainment",
      "why": "BuildBrand | Inform | Engage | Attract | Retain | Prove | Inspire | Educate | Sell",
      "how": "Storytelling | ShortBlocks | NewsFormat | ListFormat | MinimalText | LongForm",
      "feeling": "Pride | Trust | Excitement | Inspiration | Joy | Belonging | Motivation | Curiosity | Anticipation | Authority | Empathy"
    }
  ]
}`;
}
