import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { TProfile } from '../profiles/entities/profile.entity';
import { AiPost } from './entities/aiPost.entity';
import { AiReplicateService } from './ai-replicate.service';
import { GalleryPhotoType, AIArtifactType } from '@prisma/client';
import { IdeasBatchSchema } from '../idea/schema/idea.schema';
import { IdeaAISchema } from '../ideaAI/schema/ideaAI.schema';
import {
  PostsResponseSchema,
  StoriesResponseSchema,
  NormalizedPromptSchema,
} from './schema/ai-content.schema';
import { jsonrepair } from 'jsonrepair';
import * as process from 'node:process';
import { ideaPrompt } from './prompts/idea/idea';
import { TRANSLATE_TO_ENGLISH_SYSTEM_PROMPT } from './prompts/translate/translate';
import {
  contentPlanRoleBlock,
  contentPlanBusinessContextBlock,
  contentPlanIdeasBlock,
  contentPlanOutputBlock,
} from './prompts/contentPlan/content';
import {
  ContentPlanResponseSchema,
  ContentPlanPostSchema,
} from './schema/ai-content-plan.schema';
import { z } from 'zod';

import {
  postRoleBlock,
  postBusinessContextBlock,
  postCompetitorBlock,
  postIdeaBlock,
  postTextGenerationBlock,
  postFormatReplicationBlock,
  postImagePromptBlock,
  postOutputBlock,
  normalizeUserPromptBlock,
} from './prompts/post/content';

import {
  storyRoleBlock,
  storyBusinessContextBlock,
  storyCompetitorBlock,
  storyIdeaBlock,
  storyTextGenerationBlock,
  storyFormatReplicationBlock,
  storyOutputBlock,
  storyImagePromptBlock,
  storyRulesBlock,
} from './prompts/story/content';

type Photo = {
  url: string;
  type: GalleryPhotoType | AIArtifactType;
  description: string | null;
};

@Injectable()
export class AiService {
  private model: ChatOpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly aiReplicate: AiReplicateService) {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private safeParseJson(text: string): any {
    try {
      return JSON.parse(jsonrepair(text));
    } catch (e) {
      this.logger.error('Failed to parse AI JSON response', text);
      throw new Error('AI returned malformed JSON');
    }
  }

  async generatePostsBasedOnBusinessProfile(
    profile: TProfile,
    photos: Photo[],
  ): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(profile, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const parsed = PostsResponseSchema.parse(this.safeParseJson(rawText));
    const posts: AiPost[] = parsed.posts;

    for (const post of posts) {
      if (post.image_prompt) {
        post.imageUrl = await this.aiReplicate.generatePostImage(
          post.image_prompt,
          profile.businessId,
          photos,
        );
      }
    }

    return posts;
  }

  async generateStoriesBasedOnBusinessProfile(
    profile: TProfile,
    photos: Photo[],
  ): Promise<any[]> {
    const prompt = this.buildPromptForStories(profile, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const parsed = StoriesResponseSchema.parse(this.safeParseJson(rawText));
    const stories: any[] = parsed.stories;

    for (const story of stories) {
      if (story.image_prompt) {
        story.imageUrl = await this.aiReplicate.generateStoryImage(
          story.image_prompt,
          profile.businessId,
          photos,
        );
      }
    }

    return stories;
  }

  async generatePostsBasedOnManuallySettings(
    settings,
    photos: Photo[],
  ): Promise<AiPost[]> {
    const prompt = await this.buildPromptForPostsManually(settings, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const parsed = PostsResponseSchema.parse(this.safeParseJson(rawText));

    return parsed.posts;
  }

  async generateStoriesBasedOnManuallySettings(
    settings,
    photos: Photo[],
  ): Promise<AiPost[]> {
    const prompt = await this.buildPromptForStoriesManually(settings, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const parsed = StoriesResponseSchema.parse(this.safeParseJson(rawText));

    return parsed.stories;
  }

  async generateAiPhoto(
    businessId: string,
    prompt: string,
    photos: Photo[],
    aspectRatio?: string,
  ): Promise<string> {
    return await this.aiReplicate.generateAiPhoto(
      prompt,
      businessId,
      photos,
      aspectRatio,
    );
  }

  async analyzeCompetitorPosts(posts: any[]) {
    const structuredModel = this.model.withStructuredOutput(IdeasBatchSchema);

    const payload = posts.map((p) => ({
      sourceId: p.sourceId,
      sourceType: p.sourceType,
      competitorId: p.competitorId,
      platform: p.platform,
      text: p.text,
      likes: p.likes,
      shares: p.shares,
      views: p.views,
    }));

    const prompt = `
      You are a senior social media marketing analyst.

      Your task is to analyze EACH competitor content item and extract ONE reusable marketing idea per item.

      Content items come from different sources: FacebookPost, InstagramPost, InstagramReel, FacebookAd.

      IMPORTANT RULES:

      - Return EXACTLY the same number of ideas as content items.
      - Do NOT skip items.
      - Do NOT merge items.
      - Extract a MARKETING IDEA that can be reused by another business.
      - Each idea MUST include the exact sourceId, sourceType, and competitorId from the input item.
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

      Content items:
      ${JSON.stringify(payload)}
     `;

    const result = await structuredModel.invoke(prompt);

    return result.ideas;
  }

  async generateIdeas(
    business,
    existingIdeas: Array<{ title: string; description: string }>,
  ) {
    const structuredModel = this.model.withStructuredOutput(IdeaAISchema);
    const prompt = ideaPrompt(business, existingIdeas);
    const result = await structuredModel.invoke(prompt);

    return result.ideas;
  }

  private buildPromptForPosts(profile, photos) {
    const audienceBlock = this.getAudiences(profile.audiences);
    const productsBlock = this.getProducts(profile.products);
    const ideas = profile.ideas?.length > 0 ? profile.ideas : profile.ideasAi;
    const ideasBlock = this.getIdeas(ideas);
    const textPrompts = this.buildPromptsBlock(
      profile.prompts.filter((p) => p.purpose === 'Text'),
    );
    const imagePrompts = profile.prompts
      .filter((p) => p.purpose === 'Image' && p.isActive)
      .map((p) => p.text);

    const prompt = [
      postRoleBlock(),
      postBusinessContextBlock(profile, audienceBlock, productsBlock),
      postCompetitorBlock(),
      postIdeaBlock(ideasBlock),
      postTextGenerationBlock(textPrompts),
      postFormatReplicationBlock(),
      postImagePromptBlock(imagePrompts, profile, photos),
      postOutputBlock(),
    ];

    return prompt.join('\n\n');
  }

  private async buildPromptForPostsManually(profile, photos) {
    let textPrompts: string[] = [];
    let imagePrompts: string[] = [];

    if (profile.prompt) {
      const customPrompt = normalizeUserPromptBlock(profile.prompt);
      const customPromptResponse = await this.model.invoke(customPrompt);
      const customPromptRawText = this.extractTextContent(
        customPromptResponse.content,
      );
      const parsedPrompts = NormalizedPromptSchema.parse(
        this.safeParseJson(customPromptRawText),
      );
      textPrompts = parsedPrompts.text;
      imagePrompts = parsedPrompts.image;
    }

    const audienceBlock = this.getAudiences(profile.audiences);
    const productsBlock = this.getProducts(profile.products);

    const ideas = profile.ideas?.length > 0 ? profile.ideas : profile.ideasAi;
    const ideasBlock = this.getIdeas(ideas);

    const prompt = [
      postRoleBlock(),
      postBusinessContextBlock(profile, audienceBlock, productsBlock),
      postCompetitorBlock(),
      postIdeaBlock(ideasBlock, profile.prompt),
      postTextGenerationBlock(textPrompts),
      postFormatReplicationBlock(),
      postImagePromptBlock(imagePrompts, profile, photos, profile.prompt),
      postOutputBlock(),
    ];

    return prompt.join('\n\n');
  }

  private buildPromptForStories(profile, photos) {
    const audienceBlock = this.getAudiences(profile.audiences);
    const productsBlock = this.getProducts(profile.products);

    const ideas = profile.ideas?.length > 0 ? profile.ideas : profile.ideasAi;
    const ideasBlock = this.getIdeas(ideas);

    const textPrompts = this.buildPromptsBlock(
      profile.prompts.filter((p) => p.purpose === 'Text'),
    );
    const imagePrompts = profile.prompts
      .filter((p) => p.purpose === 'Image' && p.isActive)
      .map((p) => p.text);

    const prompt = [
      storyRoleBlock(),
      storyBusinessContextBlock(profile, audienceBlock, productsBlock),
      storyRulesBlock(),
      storyCompetitorBlock(),
      storyIdeaBlock(ideasBlock),
      storyTextGenerationBlock(textPrompts),
      storyFormatReplicationBlock(),
      storyImagePromptBlock(imagePrompts, profile, photos),
      storyOutputBlock(),
    ];

    return prompt.join('\n\n');
  }

  private async buildPromptForStoriesManually(profile, photos) {
    let textPrompts: string[] = [];
    let imagePrompts: string[] = [];

    if (profile.prompt) {
      const customPrompt = normalizeUserPromptBlock(profile.prompt);
      const customPromptResponse = await this.model.invoke(customPrompt);
      const customPromptRawText = this.extractTextContent(
        customPromptResponse.content,
      );
      const parsedPrompts = NormalizedPromptSchema.parse(
        this.safeParseJson(customPromptRawText),
      );
      textPrompts = parsedPrompts.text;
      imagePrompts = parsedPrompts.image;
    }

    const audienceBlock = this.getAudiences(profile.audiences);
    const productsBlock = this.getProducts(profile.products);

    const ideas = profile.ideas?.length > 0 ? profile.ideas : profile.ideasAi;
    const ideasBlock = this.getIdeas(ideas);

    const prompt = [
      storyRoleBlock(),
      storyBusinessContextBlock(profile, audienceBlock, productsBlock),
      storyRulesBlock(),
      storyCompetitorBlock(),
      storyIdeaBlock(ideasBlock, profile.prompt),
      storyTextGenerationBlock(textPrompts),
      storyFormatReplicationBlock(),
      storyImagePromptBlock(imagePrompts, profile, photos, profile.prompt),
      storyOutputBlock(),
    ];

    return prompt.join('\n\n');
  }

  private extractTextContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((block) => {
          if (typeof block === 'string') return block;
          if ('text' in block) return block.text;
          return '';
        })
        .join('');
    }

    return '';
  }

  getAudiences(audiences?) {
    if (!audiences?.length) return '';
    return audiences
      .map(
        (a, i) => `
        Audience ${i + 1}:
        - Age range: ${a.ageRange}
        - Gender: ${a.gender ?? 'any'}
        - Location: ${a.geo}
        - Pains: ${a.pains.join(', ')}
        - Desires: ${a.desires.join(', ')}
        - Triggers: ${a.triggers.join(', ')}
        - Income level: ${a.incomeLevel ?? 'not specified'}
        `,
      )
      .join('\n');
  }

  getProducts(products?) {
    if (!products?.length) return '';
    return products
      .filter((p) => p.isActive)
      .map(
        (p, i) => `
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
        `,
      )
      .join('\n');
  }

  getIdeas(ideas?) {
    return ideas && ideas.length
      ? ideas
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
        `,
          )
          .join('\n')
      : ` No specific idea provided. Generate a post based only on business context and audience insights.`;
  }

  buildPromptsBlock(prompts: any[]) {
    return prompts
      .filter((p) => p.isActive)
      .map((p, i) => `Prompt ${i + 1}: - ${p.text}`)
      .join('\n');
  }

  async generateContentPlan(settings: {
    business: {
      name: string;
      industry?: string | null;
      website: string;
      language: string;
      brand: string;
      advantages: string[];
      goals: string[];
    };
    audiences: {
      ageRange: string;
      gender?: string | null;
      geo: string;
      pains: string[];
      desires: string[];
      triggers: string[];
      incomeLevel?: string | null;
    }[];
    products: {
      name: string;
      type: string;
      description: string;
      priceSegment: string;
      isActive: boolean;
    }[];
    ideas: {
      title: string;
      description: string;
      feeling?: string;
      who?: string;
      what?: string;
      why?: string;
      how?: string;
      competitorText?: string | null;
    }[];
    context?: string;
  }): Promise<{
    title: string;
    description: string;
    posts: z.infer<typeof ContentPlanPostSchema>[];
  }> {
    const audienceBlock = this.getAudiences(settings.audiences);
    const productsBlock = this.getProducts(settings.products);
    const ideasBlock = this.getIdeas(settings.ideas);

    const prompt = [
      contentPlanRoleBlock(),
      contentPlanBusinessContextBlock(
        settings.business,
        audienceBlock,
        productsBlock,
      ),
      contentPlanIdeasBlock(ideasBlock, settings.context),
      contentPlanOutputBlock(),
    ].join('\n\n');

    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const parsed = ContentPlanResponseSchema.parse(this.safeParseJson(rawText));

    return {
      title: parsed.title,
      description: parsed.description,
      posts: parsed.posts,
    };
  }

  async translateToEnglish(text: string): Promise<string> {
    try {
      const response = await this.model.invoke([
        ['system', TRANSLATE_TO_ENGLISH_SYSTEM_PROMPT],
        ['human', text],
      ]);
      return this.extractTextContent(response.content);
    } catch (error) {
      this.logger.warn(
        'Failed to translate prompt to English, using original text',
        error,
      );
      return text;
    }
  }

  async generateVideoPrompt(
    description: string,
    business: { name: string; [key: string]: any },
  ): Promise<string> {
    const prompt = `You are a professional video prompt engineer for the Higgsfield AI video generation API.

Business context:
- Name: ${business.name}

User's short description:
"${description}"

Transform this into a detailed, cinematic video generation prompt for Higgsfield.
Describe: visual composition, camera movement, lighting, color palette, mood, and pacing.
Keep it brand-appropriate and suitable for social media.

Return ONLY the prompt text, no JSON, no explanation.`;

    const response = await this.model.invoke(prompt);
    const content = response.content;
    return typeof content === 'string'
      ? content.trim()
      : String(content).trim();
  }
}
