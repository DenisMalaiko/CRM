import {Injectable} from '@nestjs/common';
import {ChatOpenAI} from "@langchain/openai";
import {TProfile} from "../profiles/entities/profile.entity";
import {AiPost} from "./entities/aiPost.entity";
import {AiImageService} from "./ai-image.service";
import {AiReplicate} from "./ai-replicate";

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor(
    private readonly aiImageService: AiImageService,
    private readonly aiReplicate: AiReplicate
  ) {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePostsBasedOnBusinessProfile(profile: TProfile, photoUrls: string[]): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(profile);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const posts: AiPost[] = JSON.parse(rawText)?.posts ?? [];

    for (const post of posts) {
      if (post.image_prompt) {
        post.imageUrl = await this.aiReplicate.generateImageOpenAI(post.image_prompt, profile.businessId, photoUrls);
      }
    }

    return posts;
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

    const buildPromptsBlock = (prompts: any[]) =>
      prompts
        .filter(p => p.isActive)
        .map((p, i) => `
          Prompt ${i + 1}:
          - ${p.text}
          `)
        .join('\n');

    const textPromptsBlock = buildPromptsBlock(profile.prompts.filter(p => p.purpose === 'Text'));

    const imagePromptsBlock = buildPromptsBlock(profile.prompts.filter(p => p.purpose === 'Image'));

    return `
      You are a senior performance marketer and creative strategist.
  
      Your task is to generate high-quality, conversion-focused social media posts
      based strictly on the provided Business Profile context.
      
      Generate 1 post
      
      Business Profile:
      - Business name: ${profile.business.name}
      - Industry: ${profile.business.industry}
      - Website: ${profile.business.website}
      
      Profile context:
      - Profile name: ${profile.name}
      - Profile focus: ${profile.profileFocus}
      
      ### TEXT GENERATION INSTRUCTIONS (CRITICAL)

      The following instructions apply ONLY to:
      - hook
      - body
      - cta
      - emotional_angle
      
      You MUST strictly follow them when generating textual content.
      If there is any conflict, these instructions have higher priority.
      
      ${textPromptsBlock}
      
      ### IMAGE GENERATION INSTRUCTIONS (CRITICAL)
      
      The following instructions apply ONLY to:
      - image_prompt
      
      The image_prompt is a technical visual instruction for an image generation model.
      It is NOT a creative description and NOT a marketing text.
      
      Image prompt generation rules (MANDATORY):
      
      When generating "image_prompt", you MUST:
      
      1. Treat ${imagePromptsBlock} as a factual analysis of an existing visual style.
         Do NOT reinterpret, summarize, or generalize it.
      
      2. Decorative elements described in ${imagePromptsBlock}
         (graphic overlays, diagonal stripes, color bands, lines, frames, outlines)
         define the core visual identity and MUST be treated as fixed style constraints.
      
      3. Reconstruct the decorative structure exactly as described:
         preserve the role, dominance, placement, layering, and geometry of decorative elements.
         Do NOT invent new decorative elements and do NOT soften their importance.
      
      4. Describe ONLY visual and structural elements that can be directly inferred
         from the analyzed image style.
         Do NOT include emotions, marketing language, CTAs, or abstract adjectives.
      
      5. Generate image_prompt as a faithful style transfer:
         apply the same decorative system to a different scene
         while keeping the decorative logic unchanged.
      
      6. If multiple image instructions exist, resolve them by preserving
         decorative structure first, scene second.
      
      7. Write the final image_prompt in clear, literal English suitable for
         a diffusion-based image generation model.
      
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
      
      Output format (STRICT JSON ONLY):
      
      {
        "posts": [
          {
            "platform": "Facebook | Instagram | Twitter | LinkedIn | Telegram",
            "hook": "string (may include emojis)",
            "body": "string (natural, emotional, human tone, emojis allowed)",
            "cta": "string (soft, friendly call to action)",
            "emotional_angle": "fear | desire | convenience | safety | urgency",
            "image_prompt": "string (detailed visual description for image generation, use English language)"
          }
        ]
      }
      
      Return ONLY the JSON object. No extra text.
    `
  }

  private extractTextContent(content: any): string {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map(block => {
          if (typeof block === "string") return block;
          if ("text" in block) return block.text;
          return "";
        })
        .join("");
    }

    return "";
  }
}