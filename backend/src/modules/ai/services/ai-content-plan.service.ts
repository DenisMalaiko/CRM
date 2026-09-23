import { Injectable } from '@nestjs/common';
import { AiBaseService } from './ai-base.service';
import {
  ContentPlanResponseSchema,
  ContentPlanPostSchema,
} from '../schema/ai-content-plan.schema';
import {
  contentPlanRoleBlock,
  contentPlanBusinessContextBlock,
  contentPlanIdeasBlock,
  contentPlanOutputBlock,
} from '../prompts/contentPlan/content';
import { z } from 'zod';

@Injectable()
export class AiContentPlanService {
  constructor(private readonly base: AiBaseService) {}

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
    // TODO: move logic from ai.service.ts
    throw new Error('Not implemented');
  }
}
