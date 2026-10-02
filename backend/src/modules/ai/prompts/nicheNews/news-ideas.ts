export function newsIdeasRoleBlock(): string {
  return `You are a creative social media strategist. Generate actionable content ideas for posts and stories based on trending news articles. Your ideas must be deeply tied to the business's specific products/services and resonate with their target audience.`;
}

export type NewsIdeasBusinessContext = {
  name: string;
  industry: string;
  goals: string[];
  advantages: string[];
  brand?: string;
  products?: Array<{ name: string; description: string; type: string }>;
  audiences?: Array<{
    name: string;
    pains: string[];
    desires: string[];
    interests: string[];
  }>;
};

export function newsIdeasContextBlock(
  business: NewsIdeasBusinessContext,
): string {
  const lines = [
    `## BUSINESS CONTEXT`,
    ``,
    `- Business name: ${business.name}`,
    `- Industry: ${business.industry}`,
    `- Goals: ${business.goals.join(', ')}`,
    `- Competitive advantages: ${business.advantages.join(', ')}`,
  ];

  if (business.brand) {
    lines.push(`- Brand voice: ${business.brand}`);
  }

  if (business.products?.length) {
    lines.push(``, `### Products / Services`);
    for (const p of business.products) {
      lines.push(`- **${p.name}** (${p.type}): ${p.description}`);
    }
  }

  if (business.audiences?.length) {
    lines.push(``, `### Target Audience`);
    for (const a of business.audiences) {
      const parts = [`**${a.name}**`];
      if (a.pains.length) parts.push(`Pains: ${a.pains.join(', ')}`);
      if (a.desires.length) parts.push(`Desires: ${a.desires.join(', ')}`);
      if (a.interests.length)
        parts.push(`Interests: ${a.interests.join(', ')}`);
      lines.push(`- ${parts.join(' | ')}`);
    }
  }

  return lines.join('\n');
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
- Where relevant, tie the idea to a specific product or service the business offers — don't just comment on the news generically.
- Consider the target audience's pains, desires, and interests when framing the idea.
- If brand voice is provided, the tone of title and description should reflect it.
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
