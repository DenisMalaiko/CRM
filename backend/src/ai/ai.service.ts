import {Injectable} from '@nestjs/common';
import {ChatOpenAI} from "@langchain/openai";
import {TProfile} from "../profiles/entities/profile.entity";
import {AiPost} from "./entities/aiPost.entity";

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePostsBasedOnBusinessProfile(profile: TProfile): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(profile);
    const response = await this.model.invoke(prompt);
    return JSON.parse(response.content)?.posts;
  }

  private buildPromptForPosts(profile) {
    const audienceBlock = profile.audiences
      .map((a, i) => `
        Audience ${i + 1}:
        - Age range: ${a.ageRange}
        - Gender: ${a.gender ?? 'any'}
        - Location: ${a.geo}
        - Pains: ${a.pains.join(', ')}
        - Desires: ${a.desires.join(', ')}
        - Triggers: ${a.triggers.join(', ')}
        - Income level: ${a.incomeLevel ?? 'not specified'}
        `)
      .join('\n');

    const productsBlock = profile.products
      .filter(p => p.isActive)
      .map((p, i) => `
        Product ${i + 1}:
        - Name: ${p.name}
        - Type: ${p.type}
        - Description: ${p.description}
        - Price segment: ${p.priceSegment}
        - Positioning hint: ${
          p.priceSegment === 'Premium'
            ? 'high value, quality, exclusivity'
            : p.priceSegment === 'Middle'
              ? 'balanced value and affordability'
              : 'accessible, cost-effective, practical'
        }
        `)
      .join('\n');

    return `
      You are a senior performance marketer and creative strategist.
  
      Your task is to generate high-quality, conversion-focused social media posts
      based strictly on the provided Business Profile context.
      
      Business Profile:
      - Business name: ${profile.business.name}
      - Industry: ${profile.business.industry}
      - Website: ${profile.business.website}
      
      Profile context:
      - Profile name: ${profile.name}
      - Profile focus: ${profile.profileFocus}
      
      Target audience:
      ${audienceBlock}
      
      Products and services:
      ${productsBlock}
      
      Task:
      ${profile.profileFocus}.
      
      Guidelines:
      - Adapt tone and style to each platform
      - Speak directly to audience pains and desires
      - Use emotional hooks (fear, relief, safety, convenience, urgency)
      - Emojis are allowed and encouraged if they fit naturally
      - Avoid generic marketing clichés
      - Be concrete and relatable
      
      Restrictions:
      - Do NOT invent business details
      - Do NOT mention that you are an AI
      - Do NOT add explanations or commentary outside the posts
      - Do NOT use markdown formatting
      
      Output format (STRICT JSON ONLY):
      
      {
        "posts": [
          {
            "platform": "Facebook | Instagram | Twitter | LinkedIn | Telegram",
            "hook": "string (may include emojis)",
            "body": "string (natural, emotional, human tone, emojis allowed)",
            "cta": "string (soft, friendly call to action)",
            "emotional_angle": "fear | desire | convenience | safety | urgency"
          }
        ]
      }
      
      Return ONLY the JSON object. No extra text.
    `
  }

}