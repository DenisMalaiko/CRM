import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Business,
  TargetAudience,
  Product,
  Idea,
  IdeaAI,
} from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  GenerateContentPlanDto,
  UpdateContentPlanDto,
} from './dto/contentPlan.dto';

const CONTENT_PLAN_LIST_SELECT = {
  id: true,
  businessId: true,
  title: true,
  description: true,
  status: true,
  mode: true,
  createdAt: true,
} as const;

@Injectable()
export class ContentPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async getContentPlans(businessId: string) {
    return this.prisma.contentPlan.findMany({
      where: { businessId },
      select: CONTENT_PLAN_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContentPlanPosts(id: string) {
    const plan = await this.prisma.contentPlan.findUnique({
      where: { id },
      select: { postsJson: true },
    });

    if (!plan) throw new NotFoundException('Content plan not found');

    return plan.postsJson;
  }

  async generateContentPlan(businessId: string, dto: GenerateContentPlanDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) throw new NotFoundException('Business not found');

    let audiences: TargetAudience[] = [];
    let products: Product[] = [];
    let ideas: (Idea | IdeaAI)[] = [];

    if (dto.mode === 'manual') {
      if (dto.audiencesIds?.length) {
        audiences = await this.prisma.targetAudience.findMany({
          where: { id: { in: dto.audiencesIds }, businessId },
        });
      }

      if (dto.productsIds?.length) {
        products = await this.prisma.product.findMany({
          where: { id: { in: dto.productsIds }, businessId },
        });
      }

      if (dto.ideasIds?.length) {
        const manualIdeas = await this.prisma.idea.findMany({
          where: { id: { in: dto.ideasIds }, businessId },
        });
        const aiIdeas = await this.prisma.ideaAI.findMany({
          where: { id: { in: dto.ideasIds }, businessId },
        });
        ideas = [...manualIdeas, ...aiIdeas];
      }
    }

    const result = await this.aiService.generateContentPlan({
      business,
      audiences,
      products,
      ideas,
      context: dto.context,
    });

    return this.prisma.contentPlan.create({
      data: {
        businessId,
        title: result.title,
        description: result.description,
        mode: dto.mode,
        postsJson: result.posts,
      },
      select: CONTENT_PLAN_LIST_SELECT,
    });
  }

  async updateContentPlan(id: string, dto: UpdateContentPlanDto) {
    const plan = await this.prisma.contentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Content plan not found');

    return this.prisma.contentPlan.update({
      where: { id },
      data: dto,
    });
  }

  async deleteContentPlan(id: string) {
    const plan = await this.prisma.contentPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Content plan not found');

    return this.prisma.contentPlan.delete({ where: { id } });
  }
}
