import {Injectable} from '@nestjs/common';
import {ChatOpenAI} from "@langchain/openai";
import {TProfile} from "../profiles/entities/profile.entity";
import {AiPost} from "./entities/aiPost.entity";
import {AiImageService} from "./ai-image.service";

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor(
    private readonly aiImageService: AiImageService
  ) {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePostsBasedOnBusinessProfile(profile: TProfile): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(profile);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const posts: AiPost[] = JSON.parse(rawText)?.posts ?? [];

    for (const post of posts) {
      if (post.image_prompt) {
        post.imageUrl = await this.aiImageService.generateImage(post.image_prompt);
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

    const textPromptsBlock = buildPromptsBlock(
      profile.prompts.filter(p => p.purpose === 'Text')
    );

    const imagePromptsBlock = buildPromptsBlock(
      profile.prompts.filter(p => p.purpose === 'Image')
    );

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
      
      They MUST influence visual style, mood, composition, camera, lighting, scene,
      but MUST NOT affect the textual content.
      
      Image prompt generation rules (MANDATORY):

      When generating "image_prompt", you MUST:
      1. Start from the ${imagePromptsBlock} above
      2. Explicitly incorporate their visual requirements (style, mood, lighting, composition)
      3. Describe ONLY visual elements (no marketing text, no CTAs, no emotions as words)
      4. Write image_prompt as if it will be sent directly to an image generation model
      5. If image instructions exist, image_prompt MUST reflect them clearly
      
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
      
      Formatting rules:
      - Lists are allowed inside text fields
      - Lists must be formatted as plain text
      - Use numbered items: 1., 2., 3., etc.
      - Line breaks inside strings are allowed using
      - Do NOT use markdown symbols (*)
      
      
      Output format (STRICT JSON ONLY):
      
      {
        "posts": [
          {
            "platform": "Facebook | Instagram | Twitter | LinkedIn | Telegram",
            "hook": "string (may include emojis)",
            "body": "string (natural, emotional, human tone, emojis allowed)",
            "cta": "string (soft, friendly call to action)",
            "emotional_angle": "fear | desire | convenience | safety | urgency",
            "image_prompt": "string (detailed visual description for image generation)"
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