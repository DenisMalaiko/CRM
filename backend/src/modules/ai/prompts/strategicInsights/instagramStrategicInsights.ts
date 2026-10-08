import { TInstagramReport } from '../../../business/entities/business.entity';

type TBusiness = {
  name: string;
  industry?: string | null;
  goals: string[];
  advantages: string[];
  language: string;
};

export function instagramStrategicInsightsPrompt(
  business: TBusiness,
  igReport: TInstagramReport,
): string {
  return `
${roleBlock()}

---

${businessContextBlock(business)}

---

${instagramReportBlock(igReport)}

---

${taskBlock()}

---

${outputBlock()}
`.trim();
}

function roleBlock(): string {
  return `
You are a senior social media strategist with deep expertise in Instagram marketing analytics.
Your task is to analyze a business's Instagram presence using quantitative metrics,
focusing on content strategy, Stories, Reels, and visual content performance,
then deliver precise, actionable strategic insights that will help the business grow.
`.trim();
}

function businessContextBlock(business: TBusiness): string {
  return `
## BUSINESS CONTEXT

- Name: ${business.name}
- Industry: ${business.industry ?? 'not specified'}
- Language: ${business.language}
- Business goals: ${business.goals.length ? business.goals.join(', ') : 'not specified'}
- Key advantages: ${business.advantages.length ? business.advantages.join(', ') : 'not specified'}
`.trim();
}

function instagramReportBlock(report: TInstagramReport): string {
  return `
## INSTAGRAM REPORT DATA

### Audience & Content Volume
- Followers: ${report.followers}
- Total posts: ${report.posts}

### Post Format Distribution
- Image posts: ${report.postsImageCount}
- Video posts: ${report.postsVideoCount}
- Carousel posts: ${report.postsCarouselCount}

### Reels
- Reels count: ${report.reels}

### Stories Overview
- Total stories: ${report.stories}
- Story images: ${report.storiesImageCount}
- Story videos: ${report.storiesVideoCount}
`.trim();
}

function taskBlock(): string {
  return `
## TASK

Analyze ALL the data above and produce EXACTLY 6 strategic insights in Ukrainian language:
- EXACTLY 2 insights of type "strength" — what is already working well on this Instagram presence
- EXACTLY 2 insights of type "improvement" — what needs attention, correction, or more focus
- EXACTLY 2 insights of type "opportunity" — concrete growth opportunities the business can pursue

Requirements for each insight:
- title: 5–10 words, specific and action-oriented, in Ukrainian
- description: 2–3 full sentences in Ukrainian that explain the finding, why it matters, and what to do about it
- Base every insight on the actual data provided — no generic advice
- Write like a professional marketing consultant
- No emojis, no bullet points inside descriptions
`.trim();
}

function outputBlock(): string {
  return `
## OUTPUT FORMAT

Return ONLY valid JSON. No explanations, no markdown code blocks.

{
  "insights": [
    {
      "type": "strength" | "improvement" | "opportunity",
      "title": "...",
      "description": "..."
    }
  ]
}
`.trim();
}
