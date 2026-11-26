import { Injectable, Logger } from '@nestjs/common';
import { AiBaseService, AiModel } from './ai-base.service';
import {
  StrategistResponseSchema,
  CopywriterResponseSchema,
  ContentPlanResponseSchema,
  PhotoMatcherResponseSchema,
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
  artDirectorDesignSystemBlock,
  artDirectorTaskBlock,
} from '../prompts/contentPlan/art-director';
import {
  photoMatcherSystemPrompt,
  photoMatcherTaskBlock,
} from '../prompts/contentPlan/photo-matcher';
import { z } from 'zod';
import { FalImageService } from '../fal/fal-image.service';
import { FalGenerateInput } from '../fal/fal.types';

export interface ContentPlanSettings {
  business: {
    id: string;
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
  photos?: {
    id: string;
    url: string;
    description: string;
  }[];
  designSystem?: {
    colors: Record<string, string>;
    gradients: Record<string, unknown>[];
    typography: Record<string, unknown>;
    radius: string;
    border: Record<string, string>;
    shadow: Record<string, string>;
    spacing: Record<string, string>;
    brandElements: Record<string, unknown>;
    composition: Record<string, unknown>;
    scene: Record<string, unknown>;
  };
}

@Injectable()
export class AiContentPlanService {
  private readonly logger = new Logger(AiContentPlanService.name);

  constructor(
    private readonly base: AiBaseService,
    private readonly falImageService: FalImageService,
  ) {}

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
      settings.designSystem,
    );
    this.logger.log(`Art Director done: ${final.posts.length} posts`);

    const withPhotos = settings.photos?.length
      ? await this.runPhotoMatcher(final.posts, settings.photos)
      : final.posts;
    this.logger.log(`Photo Matcher done: ${withPhotos.length} posts`);

    const withImages = await this.runImageGenerator(
      withPhotos,
      language,
      settings.business.id,
    );
    this.logger.log(`Image Generator done: ${withImages.length} posts`);

    return {
      title: strategy.title,
      description: strategy.description,
      posts: withImages,
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
    designSystem?: ContentPlanSettings['designSystem'],
  ) {
    const postsJson = JSON.stringify(posts, null, 2);

    const prompt = [
      artDirectorSystemPrompt(),
      designSystem ? artDirectorDesignSystemBlock(designSystem) : '',
      artDirectorTaskBlock(postsJson, businessName, language),
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await this.base.getModel(AiModel.Fast).invoke(prompt);
    const rawText = this.base.extractTextContent(response.content);
    return ContentPlanResponseSchema.parse(this.base.safeParseJson(rawText));
  }

  private async runPhotoMatcher(
    posts: TContentPlanPost[],
    photos: ContentPlanSettings['photos'],
  ): Promise<TContentPlanPost[]> {
    if (!photos?.length) return posts;

    const photoDescriptions = photos.map((p) => ({
      id: p.id,
      description: p.description,
    }));

    const results = await Promise.all(
      posts.map(async (post) => {
        try {
          const prompt = [
            photoMatcherSystemPrompt(),
            photoMatcherTaskBlock(
              post.designReference,
              post.format,
              photoDescriptions,
            ),
          ].join('\n\n');

          const response = await this.base
            .getModel(AiModel.Fast)
            .invoke(prompt);
          const rawText = this.base.extractTextContent(response.content);
          const parsed = PhotoMatcherResponseSchema.parse(
            this.base.safeParseJson(rawText),
          );

          if (parsed.photoId) {
            const matchedPhoto = photos.find((p) => p.id === parsed.photoId);
            if (matchedPhoto) {
              return {
                ...post,
                photos: [{ photoId: matchedPhoto.id, url: matchedPhoto.url }],
              };
            }
          }

          return { ...post, photos: [] };
        } catch (error) {
          this.logger.warn(
            `Photo matching failed for post day ${post.day}: ${error.message}`,
          );
          return { ...post, photos: [] };
        }
      }),
    );

    return results;
  }

  private async runImageGenerator(
    posts: TContentPlanPost[],
    language: string,
    businessId: string,
  ): Promise<TContentPlanPost[]> {
    const FORMAT_ASPECT_RATIO: Record<string, '4:5' | '9:16'> = {
      POST: '4:5',
      REELS: '9:16',
      STORIES: '9:16',
    };

    const overlayLang: 'uk' | 'en' = language === 'uk' ? 'uk' : 'en';

    return Promise.all(
      posts.map(async (post) => {
        try {
          const overlayTexts = post.overlayTexts?.[overlayLang] ?? [];
          const textParts = overlayTexts.map((ot) => `${ot.type}: ${ot.text}`);

          const input: FalGenerateInput = {
            prompt: post.designReference,
            text: textParts.join(' | '),
            photoUrl: post.photos?.[0]?.url,
            referenceUrls: [], // TODO: forward designSystem reference image URLs when available
            aspectRatio: FORMAT_ASPECT_RATIO[post.format] ?? '4:5',
          };

          const hasImages = !!input.photoUrl || input.referenceUrls.length > 0;

          this.logger.log(
            `[Day ${post.day}] format=${post.format} aspect=${input.aspectRatio} photo=${input.photoUrl ? 'yes' : 'no'} text="${input.text.slice(0, 60)}"`,
          );

          if (!hasImages) {
            this.logger.warn(
              `[Day ${post.day}] Skipped — /edit endpoints require at least one image`,
            );
            return { ...post, generatedImages: [] };
          }

          const result = await this.falImageService.generateForPost(
            input,
            businessId,
          );

          return { ...post, generatedImages: result.imageUrls };
        } catch (error) {
          this.logger.warn(
            `Image generation failed for post day ${post.day}: ${error instanceof Error ? error.message : String(error)}`,
          );
          return { ...post, generatedImages: [] };
        }
      }),
    );
  }
}
