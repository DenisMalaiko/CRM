import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { CompetitorService } from "../competitor/competitor.service";
import { AiService } from "../ai/ai.service";
import { FacebookService } from "../facebook/facebook.service";
import { TIdea, TIdeaParams, TIdeaUpdate } from "./entities/idea.entity";

@Injectable()
export class IdeaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly competitorService: CompetitorService,
    private readonly facebookService: FacebookService,
  ) {}

  async getIdeas(businessId: string): Promise<TIdea[]> {
    return await this.prisma.idea.findMany({
      where: { businessId: businessId },
    });
  }

  async fetchIdeas(businessId: string, body: TIdeaParams): Promise<TIdea[] | null> {
    const competitors = await this.competitorService.getCompetitors(businessId);

    const results = await Promise.allSettled(
      competitors
        .filter(c => c?.facebookLink)
        .map(async (competitor) => {
          try {
            const competitorPosts = await this.facebookService.fetchPosts(
              competitor.id,
              competitor.facebookLink,
              body
            );

            if (!competitorPosts?.length) return [];

            const savedPosts = await this.competitorService.savePosts(
              competitor.id,
              competitorPosts
            );

            return savedPosts;

          } catch (error) {
            console.error(
              `Failed to fetch posts for competitor ${competitor.id}`,
              error.message
            );
            return [];
          }
        })
    );

    const posts = results
      .filter(r => r.status === 'fulfilled')
      .flatMap((r: any) => r.value);

    const result = await this.aiService.analyzeCompetitorPosts(posts);

    const data = result.map((post: any) => {
      const item: any = posts.find((p) => p.id === post.competitorPostId);

      return {
        ...post,
        businessId,
        competitorId: item.competitorId,
        score: this.calculateIdeaScore(item),
        url: item.url,
      };
    });

    return await this.saveIdeas(data);
  }

  async saveIdeas(ideas: any[]) {
    return await Promise.all(
      ideas.map((idea) =>
        this.prisma.idea.upsert({
          where: {
            businessId_competitorPostId_competitorId: {
              businessId: idea.businessId,
              competitorId: idea.competitorId,
              competitorPostId: idea.competitorPostId,
            },
          },
          create: idea,
          update: {
            ...idea,
          },
        })
      )
    );
  }

  async updateIdea(id: string, body: TIdeaUpdate): Promise<TIdea> {
    if (!id) {
      throw new NotFoundException('Idea ID is required');
    }

    try {
      return await this.prisma.idea.update({
        where: { id },
        data: { status: body.status }
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