import {Injectable} from '@nestjs/common';
import {ChatOpenAI} from "@langchain/openai";
import {TProfile} from "../profiles/entities/profile.entity";
import {AiPost} from "./entities/aiPost.entity";
import {AiImageService} from "./ai-image.service";
import {AiReplicate} from "./ai-replicate";
import {AiVertexImage} from "./ai-vertex";
import {GalleryPhotoType} from "@prisma/client";
import {IdeasBatchSchema} from "../idea/schema/idea.schema";

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

  async generateStoriesBasedOnBusinessProfile(profile: TProfile, photos: { url: string, type: GalleryPhotoType }[]): Promise<any[]> {
    console.log("GENERATE STORIES");
    const prompt = this.buildPromptForStories(profile);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const stories: any[] = JSON.parse(rawText)?.stories ?? [];

    for (const story of stories) {
      if (story.image_prompt) {
        story.imageUrl = await this.aiReplicate.generateStoryImageOpenAI(story.image_prompt, profile.businessId, photos);
      }
    }

    console.log("RESPONSE ", stories);
    return stories;
  }

  async analyzeCompetitorPosts(posts: any[]) {
    const structuredModel =
      this.model.withStructuredOutput(IdeasBatchSchema);

    const payload = posts.map(p => ({
      competitorPostId: p.id,
      platform: p.platform,
      text: p.text,
      likes: p.likes,
      shares: p.shares,
      views: p.views,
    }));

    const prompt = `
      You are a senior social media marketing analyst.
      
      Your task is to analyze EACH competitor post and extract ONE reusable marketing idea per post.
      
      IMPORTANT RULES:
      
      - Return EXACTLY the same number of ideas as posts.
      - Do NOT skip posts.
      - Do NOT merge posts.
      - Do NOT summarize the post.
      - Extract a MARKETING IDEA that can be reused by another business.
      - Response MUST be valid JSON only.
      - ALL textual fields MUST be written in Ukrainian language.
      
      ----------------------------
      
      IDEA REQUIREMENTS:
      
      title:
      - Ukrainian language ONLY
      - 8–15 words
      - Clear marketing concept name
      - Not generic
      - Should describe the core idea of the content
      
      description:
      - Ukrainian language ONLY
      - 3–5 full sentences
      - Explain:
        1) what happens in the post
        2) why this content works marketing-wise
        3) how another business could reuse this idea
      - Write like a professional marketing strategist
      - No emojis
      - No bullet points
      
      Return object:
      {
        "ideas": [...]
      }
      
      Posts:
      ${JSON.stringify(payload)}
     `;

    const result = await structuredModel.invoke(prompt);

    return result.ideas;
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

    const ideasBlock =
      profile.ideas && profile.ideas.length
        ? profile.ideas
          .map(
            (idea, i) => `
              Idea ${i + 1} (Creative Direction):
              - Title: ${idea.title}
              - Description: ${idea.description}
              - Target emotion: ${idea.feeling}
              - Audience intent (Who): ${idea.who}
              - Content type (What): ${idea.what}
              - Marketing goal (Why): ${idea.why}
              - Execution style (How): ${idea.how}
              
              Competitor reference post (for structure only, NOT for copying):
              """
              ${idea.competitorText ?? 'not available'}
              """
              
              How to use the competitor post (MANDATORY):
              - Extract the STRUCTURE and PSYCHOLOGY:
                - Hook pattern (1 sentence)
                - Information blocks order (bullet list)
                - CTA pattern (1 sentence)
                - Emotional triggers used (bullet list)
              - Rebuild the post from scratch for THIS business:
                - Replace all entities (teams, cities, names, numbers, phone) with business-relevant details
                - Keep only the idea + structure, not wording
              - Hard anti-copy rules:
                - Do NOT reuse phrases longer than 4 words from the competitor post
                - Do NOT keep proper nouns (club names, cities, people, phone numbers, dates)
                - Do NOT mention the competitor or that this is adapted
              `
                        )
                        .join('\n')
                      : `
              No specific idea provided.
              Generate a post based only on business context and audience insights.
            `;

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
      
      ## COMPETITOR STRUCTURE TRANSFER (REQUIRED)

      If a competitor reference post is provided:
      1) Identify its structure (hook → info blocks → CTA).
      2) Transfer that structure to the new post for this business.
      3) Keep the same pacing and energy, but rewrite all content with business context.
      
      Do NOT copy wording.
      
      ---
      
      ## CREATIVE IDEA (PRIMARY INSPIRATION)
      
      Use the following idea as the main creative direction.
      
      The idea defines:
      - WHAT the post is about
      - WHY it exists
      - WHAT emotion it should evoke
      - HOW the story should be framed
      
      If an idea is provided, posts that ignore it are INVALID.
      
      ${ideasBlock}
      
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
      - The post MUST follow the creative idea direction
      - Hook must reflect the idea narrative
      - Emojis allowed only if natural
      - Avoid generic marketing clichés
      - Do NOT invent business facts
      - Do NOT mention AI or explanations
      
      Additional constraints:
      ${textPromptsBlock}
      
      ---
      
      ## POST FORMAT REPLICATION (STRICT)

      If a competitor reference post exists, you MUST replicate its TEXT FORMAT.
      
      TEXT FORMAT means:
      - number of lines
      - order of information blocks
      - presence of score/result lines
      - use of emoji markers
      - short factual statements instead of marketing storytelling
      
      You are NOT copying wording.
      You ARE copying the STRUCTURAL TEMPLATE.
      
      Example format abstraction:
      
      Headline line
      Result line
      Event/stat list
      (optional CTA)
      
      The generated post MUST visually resemble the same posting style and pacing.
      
      Marketing-style paragraphs are NOT allowed if the reference post uses short structured lines.
      
      Rules:
      - Write engaging, human, emotionally relevant text
      + Match the structural format of the competitor post.
      + Prefer short factual lines over paragraphs when competitor uses them.
      + Preserve line-based structure instead of narrative prose.
      
      ---
            
      ## IMAGE PROMPT GENERATION (STRICT MODE)
      
      Generate the field: image_prompt.
      
      The image_prompt is a technical instruction for an image generation model.
      It describes visual structure, layout, decorative elements, AND visible text.
      
      Source of truth:
      ${imagePromptsBlock}
      
      STYLE RULES:
      - Preserve decorative style exactly as described
      - Do NOT add or remove decorative elements
      - Do NOT redesign layout
      - Visual concept MUST reflect the creative idea scenario and emotion
      
      TEXT GENERATION (MANDATORY):
      
      If layout requires headline or description,
      generate visible image text.
      
      Text rules:
      - Headline: 2–6 words
      - Description line: 5–15 words
      - Must fit typography and layout
      - Must match scene emotion
      - Treated as visual element, not marketing copy
      
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
    `;
  }

  private buildPromptForStories(profile) {
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

    const ideasBlock =
      profile.ideas && profile.ideas.length
        ? profile.ideas
          .map(
            (idea, i) => `
              Idea ${i + 1} (Creative Direction):
              - Title: ${idea.title}
              - Description: ${idea.description}
              - Target emotion: ${idea.feeling}
              - Audience intent (Who): ${idea.who}
              - Content type (What): ${idea.what}
              - Marketing goal (Why): ${idea.why}
              - Execution style (How): ${idea.how}
              
              Competitor reference post (for structure only, NOT for copying):
              """
              ${idea.competitorText ?? 'not available'}
              """
              
              How to use the competitor post (MANDATORY):
              - Extract the STRUCTURE and PSYCHOLOGY:
                - Hook pattern (1 sentence)
                - Information blocks order (bullet list)
                - CTA pattern (1 sentence)
                - Emotional triggers used (bullet list)
              - Rebuild the post from scratch for THIS business:
                - Replace all entities (teams, cities, names, numbers, phone) with business-relevant details
                - Keep only the idea + structure, not wording
              - Hard anti-copy rules:
                - Do NOT reuse phrases longer than 4 words from the competitor post
                - Do NOT keep proper nouns (club names, cities, people, phone numbers, dates)
                - Do NOT mention the competitor or that this is adapted
              `
          )
          .join('\n')
        : `
              No specific idea provided.
              Generate a post based only on business context and audience insights.
            `;

    const buildPromptsBlock = (prompts: any[]) =>
      prompts
        .filter(p => p.isActive)
        .map((p, i) => `
      Prompt ${i + 1}:
      - ${p.text}
    `)
        .join('\n');

    const imagePromptsBlock = buildPromptsBlock(
      profile.prompts.filter(p => p.purpose === 'Image')
    );

    return `
      You are a senior performance marketer and short-form content strategist.

      Generate exactly ONE social media story based on the provided business context.
      
      Stories must be optimized for Instagram / Facebook vertical story format.
      
      ---
      
      ## BUSINESS CONTEXT
      
      Business:
      - Name: ${profile.business.name}
      - Industry: ${profile.business.industry}
      - Website: ${profile.business.website}
      
      Profile:
      - Name: ${profile.name}
      - Focus: ${profile.profileFocus}
      
      ---
      
      ## TARGET AUDIENCE
      
      ${audienceBlock}
      
      ---
      
      ## PRODUCTS / SERVICES
      
      ${productsBlock}
      
      ---
      
      ## CREATIVE IDEA (PRIMARY INSPIRATION)
      
      Use the following idea as the narrative direction for the story sequence.
      
      ${ideasBlock}
      
      Stories MUST follow this narrative direction if provided.
      
      ---
      
      ## STORY STRUCTURE
      
      Generate ONE story frame that works as a standalone story.
      
      The story should follow a psychological progression:
      
      1. Hook (attention)
      2. Context or pain
      3. Solution or insight
      4. Product/service appearance
      5. CTA
      
      Not every sequence must contain all steps, but the progression must feel natural.
      
      ---
      
      ## STORY WRITING RULES
      
      Each story frame must contain:
      
      - headline (very short)
      - supporting text
      - visual idea
      - emotion trigger
      - interaction element (optional)
      
      Rules:
      
      - Headline: 2–6 words
      - Supporting text: 5–12 words
      - Stories must be punchy and scroll-stopping
      - Avoid long sentences
      - Use emotionally engaging language
      - Speak directly to audience pains/desires
      - Avoid generic marketing clichés
      - Do NOT invent business facts
      - Do NOT mention AI
      
      Tone:
      
      - dynamic
      - visual
      - conversational
      
      Emojis allowed if natural.
      
      ---
      
      ## INTERACTION ELEMENTS (OPTIONAL)
      
      You may include:
      
      - poll
      - question sticker
      - slider
      - swipe CTA
      
      Only include if they make sense.
      
      ---
      
      ## IMAGE PROMPT GENERATION (STRICT MODE)
      
      Generate the field: image_prompt.
      
      The image_prompt is a technical instruction for an image generation model.
      
      Source of truth:
      ${imagePromptsBlock}
      
      CRITICAL RULE:
      
      The generated image_prompt MUST follow the provided image prompts.
      
      If the prompt describes a specific scene, you MUST reproduce that scene exactly.
      
      Do NOT invent a different scenario.
      
      Example:
      If the prompt says:
      "football field with Goalberi logo and team members near a bus"
      
      Then the image must include:
      - football field
      - Goalberi logo
      - team members
      - bus
      - preparation for departure
      
      Do NOT replace the scene with generic stadium fans or unrelated events.
      
      ---
      
      IMAGE PROMPT WRITING RULES
      
      - Describe the scene precisely
      - Mention all key objects
      - Use one coherent paragraph
      - Focus on visual clarity
      
      ---
      
      ## OUTPUT FORMAT (STRICT JSON)
      
      {
        "stories": [
          {
            "frame": 1,
            "headline": "string",
            "text": "string",
            "emotion_trigger": "curiosity | desire | urgency | fear | excitement",
            "interaction": "none | poll | question | slider | swipe",
            "visual_description": "string",
            "image_prompt": "string"
          }
        ]
      }
      
      Return ONLY the JSON object. No explanations.
    `;
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