import { NewsItem } from '../../../nicheNews/nicheNews.service';

export function newsFilterRoleBlock(): string {
  return `You are a news relevance analyst. Your task is to determine which news articles are relevant to a specific business niche.`;
}

export function newsFilterContextBlock(
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

export function newsFilterArticlesBlock(items: NewsItem[]): string {
  const list = items
    .map(
      (item, i) =>
        `[${i}] Title: ${item.title}\n    Summary: ${item.summary || 'N/A'}`,
    )
    .join('\n\n');

  return `## NEWS ARTICLES\n\n${list}`;
}

export function newsFilterTaskBlock(): string {
  return `## TASK

Analyze each news article above and determine if it is directly relevant to the specific business niche described.

Rules:
- Be strict — only include articles that are truly relevant to THIS specific niche, not just the broad category.
- An article is relevant if it covers topics that the business or its customers would directly care about.
- Exclude generic news, unrelated industries, or articles that only loosely relate to the category.`;
}

export function newsFilterOutputBlock(): string {
  return `## OUTPUT FORMAT

Respond with valid JSON only. No explanation, no markdown fences.

{ "relevantIndexes": [0, 2, 5] }

Where the array contains the 0-based indexes of relevant articles. Return an empty array if none are relevant.`;
}
