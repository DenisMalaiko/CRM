import { Injectable } from '@nestjs/common';
import { AiBaseService } from './ai-base.service';
import { AiReplicateService } from '../ai-replicate.service';
import { GalleryPhotoType, AIArtifactType } from '@prisma/client';
import { TRANSLATE_TO_ENGLISH_SYSTEM_PROMPT } from '../prompts/translate/translate';

type Photo = {
  url: string;
  type: GalleryPhotoType | AIArtifactType;
  description: string | null;
};

@Injectable()
export class AiMediaService {
  constructor(
    private readonly base: AiBaseService,
    private readonly aiReplicate: AiReplicateService,
  ) {}

  async generateAiPhoto(
    businessId: string,
    prompt: string,
    photos: Photo[],
    aspectRatio?: string,
  ): Promise<string> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  async translateToEnglish(text: string): Promise<string> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  async generateVideoPrompt(
    description: string,
    business: { name: string; [key: string]: any },
  ): Promise<string> {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }
}
