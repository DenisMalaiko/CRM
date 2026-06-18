import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CompetitorService } from '../competitor/competitor.service';
import { AiService } from '../ai/ai.service';
import { IdeaSourceType } from '@prisma/client';
import { TIdea, TIdeaParams, TIdeaUpdate } from './entities/idea.entity';

@Injectable()
export class IdeaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly competitorService: CompetitorService,
  ) {}

  async getIdeas(
    businessId: string,
    sourceType?: IdeaSourceType,
  ): Promise<TIdea[]> {
    const where: { businessId: string; sourceType?: IdeaSourceType } = {
      businessId,
    };
    if (sourceType) {
      where.sourceType = sourceType;
    }
    return await this.prisma.idea.findMany({ where });
  }

  async fetchIdeas(businessId: string, body: TIdeaParams): Promise<any> {
    const competitors = await this.competitorService.getCompetitors(businessId);
    const allItems: any[] = [];
    const postParams = { onlyPostsNewerThan: body.onlyPostsNewerThan };
    const adsParams = {
      activeStatus: 'all',
      period: '',
      sortBy: 'most_recent',
    };

    for (const competitor of competitors) {
      if (competitor.facebookLink) {
        try {
          const posts = await this.competitorService.fetchPosts(
            competitor.id,
            postParams,
          );
          if (posts?.length) {
            allItems.push(
              ...posts.map((p: any) => ({
                ...p,
                sourceId: p.id,
                sourceType: 'FacebookPost' as const,
              })),
            );
          }
        } catch (error) {}

        try {
          const ads = await this.competitorService.fetchAds(
            competitor.id,
            adsParams,
          );
          if (ads?.length) {
            allItems.push(
              ...ads.map((a: any) => ({
                ...a,
                sourceId: a.id,
                sourceType: 'FacebookAd' as const,
                text: [a.title, a.body, a.caption].filter(Boolean).join(' — '),
                likes: 0,
                shares: 0,
                views: 0,
                comments: 0,
              })),
            );
          }
        } catch (error) {}
      }

      if (competitor.instagramLink) {
        try {
          const posts = await this.competitorService.fetchInstagramPosts(
            competitor.id,
            postParams,
          );
          if (posts?.length) {
            allItems.push(
              ...posts.map((p: any) => ({
                ...p,
                sourceId: p.id,
                sourceType: 'InstagramPost' as const,
              })),
            );
          }
        } catch (error) {}

        try {
          const reels = await this.competitorService.fetchInstagramReels(
            competitor.id,
            postParams,
          );
          if (reels?.length) {
            allItems.push(
              ...reels.map((r: any) => ({
                ...r,
                sourceId: r.id,
                sourceType: 'InstagramReel' as const,
              })),
            );
          }
        } catch (error) {}
      }
    }

    if (!allItems.length) return [];

    const result = await this.aiService.analyzeCompetitorPosts(allItems);

    const data = result
      .map((idea: any) => {
        const item = allItems.find((p) => p.sourceId === idea.sourceId);
        if (!item) return null;

        const base: any = {
          ...idea,
          businessId,
          competitorId: item.competitorId,
          score: this.calculateIdeaScore(item),
          url: item.url ?? '',
          postedAt: item.postedAt ?? item.start ?? null,
        };

        if (
          idea.sourceType === 'FacebookPost' ||
          idea.sourceType === 'InstagramPost'
        ) {
          base.competitorPostId = item.id;
        } else if (idea.sourceType === 'InstagramReel') {
          base.competitorReelId = item.id;
        } else if (idea.sourceType === 'FacebookAd') {
          base.competitorAdId = item.id;
        }

        return base;
      })
      .filter(Boolean);

    return await this.saveIdeas(data);
  }

  async saveIdeas(ideas: any[]) {
    return await Promise.all(
      ideas.map((idea) =>
        this.prisma.idea.upsert({
          where: {
            businessId_sourceType_sourceId_competitorId: {
              businessId: idea.businessId,
              sourceType: idea.sourceType,
              sourceId: idea.sourceId,
              competitorId: idea.competitorId,
            },
          },
          create: idea,
          update: {
            title: idea.title,
            description: idea.description,
            who: idea.who,
            what: idea.what,
            why: idea.why,
            how: idea.how,
            feeling: idea.feeling,
            score: idea.score,
            url: idea.url,
            postedAt: idea.postedAt,
          },
        }),
      ),
    );
  }

  async updateIdea(id: string, body: TIdeaUpdate): Promise<TIdea> {
    if (!id) {
      throw new NotFoundException('Idea ID is required');
    }

    try {
      return await this.prisma.idea.update({
        where: { id },
        data: { status: body.status },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Idea with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update idea');
    }
  }

  async deleteIdea(id: string): Promise<any> {
    try {
      return await this.prisma.idea.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Idea with ID ${id} not found`);
      }
      throw err;
    }
  }

  calculateIdeaScore(post: any): number {
    const likes = post.likes ?? 0;
    const shares = post.shares ?? 0;
    const comments = post.comments ?? 0;

    return likes + comments * 3 + shares * 5;
  }
}
