import { TFacebookReport } from '../../../business/entities/business.entity';

type TBusiness = {
  name: string;
  industry?: string | null;
  goals: string[];
  advantages: string[];
  language: string;
};

export function strategicInsightsPrompt(
  business: TBusiness,
  fbReport: TFacebookReport,
): string {
  return `
${roleBlock()}

---

${businessContextBlock(business)}

---

${facebookReportBlock(fbReport)}

---

${taskBlock()}

---

${outputBlock()}
`.trim();
}

function roleBlock(): string {
  return `
You are a senior social media strategist with deep expertise in Facebook marketing analytics.
Your task is to analyze a business's Facebook presence using quantitative metrics and real content samples,
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

function facebookReportBlock(report: TFacebookReport): string {
  const topPostTexts = Array.isArray(report.topPostTexts)
    ? report.topPostTexts
    : [];
  const topAdTexts = Array.isArray(report.topAdTexts) ? report.topAdTexts : [];

  const formatPostTexts = (
    items: Array<{ text: string; collationCount: number; url: string }>,
  ): string => {
    if (!items.length) return '  (no data)';
    return items
      .map(
        (p, i) =>
          `  ${i + 1}. Used ${p.collationCount}x — "${p.text.slice(0, 200)}${p.text.length > 200 ? '...' : ''}"`,
      )
      .join('\n');
  };

  return `
## FACEBOOK REPORT DATA

### Audience & Content Volume
- Followers: ${report.followers}
- Total posts: ${report.posts}
- Total likes: ${report.likes}

### Post Format Distribution
- Image posts: ${report.postsImageCount}
- Video posts: ${report.postsVideoCount}
- Carousel posts: ${report.postsCarouselCount}

### Advertising Overview
- Active ads (all time): ${report.activeAds}
- Active ads (last 30 days): ${report.activeAds30d}

### Ad Format Distribution
- Video ads: ${report.adsVideoCount}
- Image ads: ${report.adsImageCount}
- Carousel ads: ${report.adsCarouselCount}
- Dynamic/DCO ads: ${report.adsDcoCount}

### Ad CTA Distribution
- Website clicks: ${report.adsCtaWebsite}
- Direct messages: ${report.adsCtaDirectMessage}
- Instagram page: ${report.adsCtaInstagramPage}
- Product CTAs: ${report.adsCtaProduct}
- Meta page CTAs: ${report.adsCtaMetaPage}

### Top Recurring Post Texts
${formatPostTexts(topPostTexts)}

### Top Recurring Ad Texts
${formatPostTexts(topAdTexts)}
`.trim();
}

function taskBlock(): string {
  return `
## TASK

Analyze ALL the data above and produce EXACTLY 6 strategic insights in Ukrainian language:
- EXACTLY 2 insights of type "strength" — what is already working well on this Facebook presence
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
