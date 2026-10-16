type BusinessContext = {
  name: string;
  industry?: string | null;
  website: string;
  language: string;
  brand: string;
  advantages: string[];
  goals: string[];
};

export function strategistSystemPrompt() {
  return `You are a senior content strategist specializing in social media marketing funnels.

Your job is to create a 10-day content plan structure with exactly 10 publications (1 per day).

You understand the TOFU / MOFU / BOFU sales funnel deeply:

TOFU (Top of Funnel) — Awareness & Attraction:
- Goal: attract new audience, build brand awareness
- Content types: entertaining, educational, trend-based, relatable
- Formats that work best: REELS, STORIES
- Tone: light, engaging, shareable

MOFU (Middle of Funnel) — Consideration & Trust:
- Goal: build trust, demonstrate expertise, nurture relationships
- Content types: expert insights, case studies, behind-the-scenes, interactive (polls, Q&A)
- Formats that work best: POST, STORIES
- Tone: authoritative, helpful, conversational

BOFU (Bottom of Funnel) — Conversion & Action:
- Goal: drive sales, close objections, create urgency
- Content types: testimonials, offers, product showcases, limited deals
- Formats that work best: POST, REELS
- Tone: direct, persuasive, action-oriented

DISTRIBUTION RULES:
- Recommended split: 4 TOFU / 3 MOFU / 3 BOFU (adjust based on business goals)
- Narrative arc: start with TOFU (days 1-4 heavier), build through MOFU (days 4-7), close with BOFU (days 7-10)
- Never place two BOFU posts on consecutive days
- Mix formats across the week — do not repeat the same format on consecutive days`;
}

export function strategistBusinessBlock(
  business: BusinessContext,
  audienceBlock: string,
  productsBlock: string,
) {
  return `## BUSINESS CONTEXT

Business:
- Name: ${business.name}
- Industry: ${business.industry ?? 'Not specified'}
- Website: ${business.website}
- Content language: ${business.language}
- Brand History: ${business.brand}
- Brand Advantages: ${business.advantages.join(', ')}
- Brand Goals: ${business.goals.join(', ')}
${audienceBlock ? `\nTarget audience:\n${audienceBlock}` : ''}
${productsBlock ? `\nProducts / services:\n${productsBlock}` : ''}`;
}

export function strategistIdeasBlock(ideasBlock: string, context?: string) {
  if (ideasBlock?.trim()) {
    return `## CREATIVE DIRECTION FROM IDEAS (PRIMARY)

The following ideas are the PRIMARY DRIVER of this content plan.
Each idea MUST become at least one post — build the entire plan AROUND these ideas.

IDEA-DRIVEN PLANNING RULES:
- Assign each idea to the best-fitting funnel stage (TOFU / MOFU / BOFU), format, and day
- The "topic" and "marketingGoal" of each idea-driven post MUST clearly reflect the source idea — do not dilute or generalize
- If there are fewer than 10 ideas, fill remaining slots with supporting content that complements the ideas and maintains a balanced funnel arc
- If there are 10 or more ideas, select the 10 strongest while ensuring funnel balance
- Supporting (non-idea) posts should reinforce, build anticipation for, or follow up on the idea-driven posts

${ideasBlock}
${context?.trim() ? `\nAdditional context:\n${context}` : ''}`;
  }

  if (context?.trim()) {
    return `## CREATIVE DIRECTION

Use the following context as the primary creative direction:
"${context}"`;
  }

  return `## CREATIVE DIRECTION

No specific ideas provided. Build the content strategy based on the business context, audience insights, and brand goals.`;
}

export function strategistOutputBlock(
  language: string,
  productNames: string[] = [],
  ideaNames: string[] = [],
) {
  const safeProducts = productNames.map((n) => n.slice(0, 80));
  const safeIdeas = ideaNames.map((n) => n.slice(0, 80));
  const hasProducts = safeProducts.length > 0;
  const hasIdeas = safeIdeas.length > 0;

  let fieldInstructions = `FIELD INSTRUCTIONS:
- title: short name for the content plan (5-10 words)
- description: brief summary of the plan's funnel strategy (2-3 sentences)`;

  if (hasProducts || hasIdeas) {
    const parts: string[] = [];
    if (hasIdeas) parts.push(`ideas: ${safeIdeas.join(', ')}`);
    if (hasProducts)
      parts.push(`products/services: ${safeProducts.join(', ')}`);

    fieldInstructions = `FIELD INSTRUCTIONS:
- title: short name for the content plan (5-10 words). MUST reference the source ${parts.join(' and ')} in the title
- description: brief summary of the plan's funnel strategy (2-3 sentences). Mention that this plan is built around ${parts.join(' and ')}`;
  }

  return `## OUTPUT FORMAT (STRICT JSON)

ALL text fields MUST be written in ${language}.

${fieldInstructions}

Return a JSON object:

{
  "title": "<plan title>",
  "description": "<plan description>",
  "posts": [
    {
      "day": 1,
      "date": "DD.MM.YYYY",
      "funnelStage": "TOFU | MOFU | BOFU",
      "format": "POST | REELS | STORIES",
      "contentType": "one of: Продаючий | Інтерактивний | Експертний | Розважальний | Репутаційний | Користувацький",
      "topic": "what this post is about (1 sentence)",
      "marketingGoal": "what this post achieves in the funnel (1 sentence)"
    }
  ]
}

RULES:
- Generate exactly 10 posts for 10 consecutive days starting from tomorrow
- Each day has exactly 1 publication
- Follow the funnel distribution and narrative arc rules from your instructions
- Align contentType with funnelStage (e.g., "Розважальний" fits TOFU, "Продаючий" fits BOFU)
- ALL text fields MUST be in ${language}

Return ONLY valid JSON. No markdown. No explanations.`;
}
