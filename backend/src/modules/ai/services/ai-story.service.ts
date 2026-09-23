import { Injectable } from '@nestjs/common';
import { AiBaseService } from './ai-base.service';
import { AiReplicateService } from '../ai-replicate.service';
import { TProfile } from '../../profiles/entities/profile.entity';
import { AiPost } from '../entities/aiPost.entity';
import { GalleryPhotoType, AIArtifactType } from '@prisma/client';
import {
  StoriesResponseSchema,
  NormalizedPromptSchema,
} from '../schema/ai-content.schema';
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
} from '../prompts/story/content';

type Photo = {
  url: string;
  type: GalleryPhotoType | AIArtifactType;
  description: string | null;
};

@Injectable()
export class AiStoryService {
  constructor(
    private readonly base: AiBaseService,
    private readonly aiReplicate: AiReplicateService,
  ) {}

  async generateStoriesBasedOnBusinessProfile(
    profile: TProfile,
    photos: Photo[],
  ): Promise<any[]> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  async generateStoriesBasedOnManuallySettings(
    settings,
    photos: Photo[],
  ): Promise<AiPost[]> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  private buildPromptForStories(profile, photos): string {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  private async buildPromptForStoriesManually(
    profile,
    photos,
  ): Promise<string> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }
}
