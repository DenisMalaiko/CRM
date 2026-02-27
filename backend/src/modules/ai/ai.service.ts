import {Injectable} from '@nestjs/common';
import {ChatOpenAI} from "@langchain/openai";
import {TProfile} from "../profiles/entities/profile.entity";
import {AiPost} from "./entities/aiPost.entity";
import {AiImageService} from "./ai-image.service";
import {AiReplicate} from "./ai-replicate";
import {AiVertexImage} from "./ai-vertex";
import {GalleryPhotoType} from "@prisma/client";

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor(
    private readonly aiImageService: AiImageService,
    private readonly aiReplicate: AiReplicate,
    private readonly aiVertexImage: AiVertexImage,
  ) {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePostsBasedOnBusinessProfile(profile: TProfile, photos: { url: string, type: GalleryPhotoType }[]): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(profile);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const posts: AiPost[] = JSON.parse(rawText)?.posts ?? [];

    for (const post of posts) {
      if (post.image_prompt) {
        //post.imageUrl = await this.aiVertexImage.generateImage(post.image_prompt, profile.businessId);
        post.imageUrl = await this.aiReplicate.generateImageOpenAI(post.image_prompt, profile.businessId, photos);
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

      Generate exactly 1 social media post based on the provided business context.
      
      ---
      
      ## BUSINESS CONTEXT
      
      Business:
      - Name: ${profile.business.name}
      - Industry: ${profile.business.industry}
      - Website: ${profile.business.website}
      
      Profile:
      - Name: ${profile.name}
      - Focus: ${profile.profileFocus}
      
      Target audience:
      ${audienceBlock}
      
      Products / services:
      ${productsBlock}
      
      ---
      
      ## TEXT GENERATION (POST CONTENT)
      
      Generate the following fields:
      - hook
      - body
      - cta
      - emotional_angle
      
      Rules:
      - Write engaging, human, emotionally relevant text
      - Use relevant keywords naturally (SEO-friendly)
      - Speak to real audience pains and desires
      - Emojis are allowed if they fit naturally
      - Avoid generic marketing clichés
      - Do NOT invent business facts
      - Do NOT mention AI or explanations
      
      Additional constraints:
      ${textPromptsBlock}
      
      ---
      
      ## IMAGE PROMPT GENERATION (STRICT MODE)
      
      Generate the field: image_prompt.
      
      The image_prompt is a technical instruction for an image generation model.
      It describes visual structure, layout, decorative elements, AND visible text.
      
      Source of truth:
      ${imagePromptsBlock}
      
      STYLE RULES:
      - Preserve the decorative style exactly as described
      - Do NOT add or remove decorative elements
      - Do NOT redesign the layout
      
      TEXT GENERATION (MANDATORY):
      
      If the user request includes a requirement to add a headline, title, or description,
      you MUST generate actual text content for the image.
      
      Text rules:
      - Generate a short creative headline (2–6 words)
      - Generate a short descriptive line (5–15 words)
      - Text must fit naturally into the layout and typography
      - Text must match the scene and subject
      - Text may express emotion if explicitly requested by the user
      
      Text is treated as a visual element, not marketing copy.
      
      WRITING RULES:
      - Describe visible elements clearly
      - One coherent paragraph
      
      ---
      
      ## OUTPUT FORMAT (STRICT JSON)
      
      {
        "posts": [
          {
            "platform": "Facebook | Instagram | Twitter | LinkedIn | Telegram",
            "hook": "string",
            "body": "string",
            "cta": "string",
            "emotional_angle": "fear | desire | convenience | safety | urgency",
            "image_prompt": "string"
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