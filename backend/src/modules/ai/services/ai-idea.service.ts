import { Injectable } from '@nestjs/common';
import { AiBaseService } from './ai-base.service';
import { IdeasBatchSchema } from '../../idea/schema/idea.schema';
import { IdeaAISchema } from '../../ideaAI/schema/ideaAI.schema';
import { ideaPrompt } from '../prompts/idea/idea';

@Injectable()
export class AiIdeaService {
  constructor(private readonly base: AiBaseService) {}

  async analyzeCompetitorPosts(posts: any[]) {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }

  async generateIdeas(
    business,
    existingIdeas: Array<{ title: string; description: string }>,
  ) {
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }
}
