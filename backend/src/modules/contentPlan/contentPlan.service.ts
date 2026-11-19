import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Business,
  TargetAudience,
  Product,
  Idea,
  IdeaAI,
} from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiContentPlanService } from '../ai/services/ai-content-plan.service';
import {
  GenerateContentPlanDto,
  UpdateContentPlanDto,
  UpdateContentPlanPostDto,
} from './dto/contentPlan.dto';
import { TContentPlanPost } from './entities/contentPlan.entity';

const CONTENT_PLAN_LIST_SELECT = {
  id: true,
  businessId: true,
  title: true,
  description: true,
  status: true,
  mode: true,
  holidayName: true,
  holidayDate: true,
  createdAt: true,
  products: {
    select: { product: { select: { id: true, name: true } } },
  },
  audiences: {
    select: { targetAudience: { select: { id: true, name: true } } },
  },
  ideas: {
    select: { idea: { select: { id: true, title: true } } },
  },
  ideasAI: {
    select: { ideaAI: { select: { id: true, title: true } } },
  },
  designSystem: {
    select: { id: true, name: true, colors: true },
  },
} as const;

@Injectable()
export class ContentPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiContentPlanService: AiContentPlanService,
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
    let manualIdeas: Idea[] = [];
    let aiIdeas: IdeaAI[] = [];

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
      manualIdeas = await this.prisma.idea.findMany({
        where: { id: { in: dto.ideasIds }, businessId },
      });
      aiIdeas = await this.prisma.ideaAI.findMany({
        where: { id: { in: dto.ideasIds }, businessId },
      });
      ideas = [...manualIdeas, ...aiIdeas];
    }

    const result = await this.aiContentPlanService.generateContentPlan({
      business,
      audiences,
      products,
      ideas,
      context: dto.context,
      holidayName: dto.holidayName,
      holidayDate: dto.holidayDate,
    });

    return this.prisma.contentPlan.create({
      data: {
        businessId,
        title: result.title,
        description: result.description,
        mode: dto.mode,
        postsJson: result.posts,
        holidayName: dto.holidayName ?? null,
        holidayDate: dto.holidayDate ?? null,
        designSystemId: dto.designSystemId ?? null,
        products: products.length
          ? { create: products.map((p) => ({ productId: p.id })) }
          : undefined,
        audiences: audiences.length
          ? { create: audiences.map((a) => ({ targetAudienceId: a.id })) }
          : undefined,
        ideas: manualIdeas.length
          ? { create: manualIdeas.map((i) => ({ ideaId: i.id })) }
          : undefined,
        ideasAI: aiIdeas.length
          ? { create: aiIdeas.map((i) => ({ ideaAIId: i.id })) }
          : undefined,
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

  async updateContentPlanPost(
    id: string,
    day: number,
    dto: UpdateContentPlanPostDto,
    agencyId: string,
  ) {
    const plan = await this.prisma.contentPlan.findUnique({
      where: { id },
      select: { postsJson: true, business: { select: { agencyId: true } } },
    });

    if (!plan || plan.business.agencyId !== agencyId)
      throw new NotFoundException('Content plan not found');

    const posts = (plan.postsJson ?? []) as TContentPlanPost[];
    const post = posts.find((p) => p.day === day);

    if (!post) throw new NotFoundException('Post not found');

    Object.assign(post, dto);

    await this.prisma.contentPlan.update({
      where: { id },
      data: { postsJson: posts },
    });

    return post;
  }

  async deleteContentPlanPost(id: string, day: number, agencyId: string) {
    const plan = await this.prisma.contentPlan.findUnique({
      where: { id },
      select: { postsJson: true, business: { select: { agencyId: true } } },
    });

    if (!plan || plan.business.agencyId !== agencyId)
      throw new NotFoundException('Content plan not found');

    const posts = (plan.postsJson ?? []) as TContentPlanPost[];
    const postIndex = posts.findIndex((p) => p.day === day);

    if (postIndex === -1) throw new NotFoundException('Post not found');

    const filtered = posts.filter((p) => p.day !== day);

    await this.prisma.contentPlan.update({
      where: { id },
      data: { postsJson: filtered },
    });
  }
}
