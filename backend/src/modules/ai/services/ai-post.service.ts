import { Injectable } from '@nestjs/common';
import { AiBaseService } from './ai-base.service';
import { AiReplicateService } from '../ai-replicate.service';
import { TProfile } from '../../profiles/entities/profile.entity';
import { AiPost } from '../entities/aiPost.entity';
import { GalleryPhotoType, AIArtifactType } from '@prisma/client';
import {
  PostsResponseSchema,
  NormalizedPromptSchema,
} from '../schema/ai-content.schema';
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
} from '../prompts/post/content';

type Photo = {
  url: string;
  type: GalleryPhotoType | AIArtifactType;
  description: string | null;
};

@Injectable()
export class AiPostService {
  constructor(
    private readonly base: AiBaseService,
    private readonly aiReplicate: AiReplicateService,
  ) {}

  async generatePostsBasedOnBusinessProfile(
    profile: TProfile,
    photos: Photo[],
  ): Promise<AiPost[]> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  async generatePostsBasedOnManuallySettings(
    settings,
    photos: Photo[],
  ): Promise<AiPost[]> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  private buildPromptForPosts(profile, photos): string {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  private async buildPromptForPostsManually(profile, photos): Promise<string> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }
}
