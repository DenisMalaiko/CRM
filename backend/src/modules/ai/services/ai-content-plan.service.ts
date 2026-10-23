import { Injectable, Logger } from '@nestjs/common';
import { AiBaseService, AiModel } from './ai-base.service';
import {
  StrategistResponseSchema,
  CopywriterResponseSchema,
  ContentPlanResponseSchema,
  TContentPlanPost,
} from '../schema/ai-content-plan.schema';
import {
  strategistSystemPrompt,
  strategistBusinessBlock,
  strategistIdeasBlock,
  strategistHolidayBlock,
  strategistOutputBlock,
} from '../prompts/contentPlan/strategist';
import {
  copywriterSystemPrompt,
  copywriterIdeasContext,
  copywriterHolidayContext,
  copywriterTaskBlock,
} from '../prompts/contentPlan/copywriter';
import {
  artDirectorSystemPrompt,
  artDirectorTaskBlock,
} from '../prompts/contentPlan/art-director';
import { z } from 'zod';

interface ContentPlanSettings {
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
  holidayName?: string;
  holidayDate?: string;
}

@Injectable()
export class AiContentPlanService {
  private readonly logger = new Logger(AiContentPlanService.name);

  constructor(private readonly base: AiBaseService) {}

  async generateContentPlan(settings: ContentPlanSettings): Promise<{
    title: string;
    description: string;
    posts: TContentPlanPost[];
  }> {
    const { business } = settings;
    const language = business.language;

    const strategy = await this.runStrategist(settings, language);
    this.logger.log(
      `Strategist done: "${strategy.title}", ${strategy.posts.length} posts`,
    );

    const withCopy = await this.runCopywriter(
      strategy.posts,
      business.name,
      language,
      settings.ideas,
      settings.holidayName,
    );
    this.logger.log(`Copywriter done: ${withCopy.posts.length} posts`);

    const final = await this.runArtDirector(
      withCopy.posts,
      business.name,
      language,
    );
    this.logger.log(`Art Director done: ${final.posts.length} posts`);

    return {
      title: strategy.title,
      description: strategy.description,
      posts: final.posts,
    };
  }

  private async runStrategist(settings: ContentPlanSettings, language: string) {
    const audienceBlock = this.base.getAudiences(settings.audiences);
    const productsBlock = this.base.getProducts(settings.products);
    const ideasBlock = this.base.getIdeas(settings.ideas);

    const productNames = settings.products.map((p) => p.name);
    const ideaNames = settings.ideas.map((i) => i.title);

    const creativeBlock = settings.holidayName
      ? strategistHolidayBlock(settings.holidayName, settings.holidayDate)
      : strategistIdeasBlock(ideasBlock, settings.context);

    const prompt = [
      strategistSystemPrompt(),
      strategistBusinessBlock(settings.business, audienceBlock, productsBlock),
      creativeBlock,
      strategistOutputBlock(language, productNames, ideaNames),
    ].join('\n\n');

    const response = await this.base.getModel(AiModel.Fast).invoke(prompt);
    const rawText = this.base.extractTextContent(response.content);
    return StrategistResponseSchema.parse(this.base.safeParseJson(rawText));
  }

  private async runCopywriter(
    posts: z.infer<typeof StrategistResponseSchema>['posts'],
    businessName: string,
    language: string,
    ideas: ContentPlanSettings['ideas'],
    holidayName?: string,
  ) {
    const postsJson = JSON.stringify(posts, null, 2);
    const ideasBlock = ideas.length ? this.base.getIdeas(ideas) : '';

    const contextBlock = holidayName
      ? copywriterHolidayContext(holidayName)
      : copywriterIdeasContext(ideasBlock);

    const prompt = [
      copywriterSystemPrompt(),
      contextBlock,
      copywriterTaskBlock(postsJson, businessName, language),
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await this.base.getModel(AiModel.Fast).invoke(prompt);
    const rawText = this.base.extractTextContent(response.content);
    return CopywriterResponseSchema.parse(this.base.safeParseJson(rawText));
  }

  private async runArtDirector(
    posts: z.infer<typeof CopywriterResponseSchema>['posts'],
    businessName: string,
    language: string,
  ) {
    const postsJson = JSON.stringify(posts, null, 2);

    const prompt = [
      artDirectorSystemPrompt(),
      artDirectorTaskBlock(postsJson, businessName, language),
    ].join('\n\n');

    const response = await this.base.getModel(AiModel.Fast).invoke(prompt);
    const rawText = this.base.extractTextContent(response.content);
    return ContentPlanResponseSchema.parse(this.base.safeParseJson(rawText));
  }
}
