export function contentPlanRoleBlock() {
  return `
    You are a senior content strategist and social media planner.
    Generate a 7-day content plan with exactly 14 publications (2 per day).
  `;
}

type BusinessContext = {
  name: string;
  industry?: string | null;
  website: string;
  language: string;
  brand: string;
  advantages: string[];
  goals: string[];
};

export function contentPlanBusinessContextBlock(
  business: BusinessContext,
  audienceBlock: string,
  productsBlock: string,
) {
  return `
    ## BUSINESS CONTEXT

    Business:
    - Name: ${business.name}
    - Industry: ${business.industry ?? 'Not specified'}
    - Website: ${business.website}
    - Language: ${business.language}
    - Brand History: ${business.brand}
    - Brand Advantages: ${business.advantages.join(', ')}
    - Brand Goals: ${business.goals.join(', ')}
    ${audienceBlock ? `Target audience:\n    ${audienceBlock}` : ''}
    ${productsBlock ? `Products / services:\n    ${productsBlock}` : ''}
  `;
}

export function contentPlanIdeasBlock(ideasBlock: string, context?: string) {
  if (ideasBlock?.trim()) {
    return `
      ## CREATIVE DIRECTION FROM IDEAS

      Use the following ideas as creative inspiration for the content plan.

      ${ideasBlock}
      ${context?.trim() ? `\nAdditional context:\n${context}` : ''}
    `;
  }

  if (context?.trim()) {
    return `
      ## CREATIVE DIRECTION

      Use the following context as the primary creative direction for the content plan:
      "${context}"
    `;
  }

  return `
    ## CREATIVE DIRECTION

    No specific ideas provided. Generate a content plan based on the business context and audience insights.
    Focus on the brand's goals and advantages to create relevant, engaging content.
  `;
}

export function contentPlanOutputBlock() {
  return `
    ## OUTPUT FORMAT (STRICT JSON)

    ALL text fields MUST be written in Ukrainian.

    Return a JSON object with the following structure:

    {
      "title": "short name for the content plan (Ukrainian, 5-10 words)",
      "description": "brief summary of the plan's strategy (Ukrainian, 2-3 sentences)",
      "posts": [
        {
          "date": "DD.MM.YYYY",
          "format": "POST | REELS | STORIES",
          "contentType": "Продаючий | Інтерактивний | Експертний | Розважальний | Репутаційний | Користувацький",
          "title": "catchy headline for the publication (Ukrainian)",
          "rubric": "content section/category name (Ukrainian)",
          "designReference": "visual reference description for the publication design (Ukrainian)",
          "thesis": "key points/thesis for the publication text (Ukrainian)"
        }
      ]
    }

    RULES FOR THE PLAN:
    - Generate exactly 14 posts covering 7 consecutive days starting from tomorrow
    - Each day must have exactly 2 publications
    - Mix formats across the week (do not repeat the same format on the same day)
    - Vary content types to maintain audience interest
    - Content should build a coherent narrative across the week
    - Align all content with business goals and audience needs
    - ALL text fields MUST be in Ukrainian

    Return ONLY valid JSON. No markdown. No explanations.
  `;
}
