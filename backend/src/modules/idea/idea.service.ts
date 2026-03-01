import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { CompetitorService } from "../competitor/competitor.service";
import { AiService } from "../ai/ai.service";
import { FacebookService } from "../facebook/facebook.service";
import { TIdeaParams } from "./entities/idea.entity";

@Injectable()
export class IdeaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly competitorService: CompetitorService,
    private readonly facebookService: FacebookService,
  ) {}

  async getIdeas(businessId: string): Promise<any[]> {
    return await this.prisma.idea.findMany({
      where: { businessId: businessId },
    });
  }

  async fetchIdeas(businessId: string, body: TIdeaParams): Promise<any> {
    const competitors = await this.competitorService.getCompetitors(businessId);

    const posts: any = [];

    for (const competitor of competitors) {
      if (!competitor?.facebookLink) return null;

      const competitorPosts = await this.facebookService.fetchPosts(
        competitor.id,
        competitor.facebookLink,
        body
      );

      if(!competitorPosts) return null;

      const savedPosts = await this.competitorService.savePosts(competitor.id, competitorPosts);

      console.log("----------")
      console.log("SAVED POSTS");
      console.log("----------")

      posts.push(...savedPosts);
    }

    const result = await this.aiService.analyzeCompetitorPosts(posts);

    const data = result.map((post: any) => {
      const item = posts.find((p) => p.id === post.competitorPostId);

      return {
        ...post,
        businessId: businessId,
        competitorId: item.competitorId,
        score: this.calculateIdeaScore(item),
        url: item.url,
      }
    })

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

  calculateIdeaScore(post: any): number {
    const likes = post.likes ?? 0;
    const shares = post.shares ?? 0;

    return likes + shares * 3;
  }
}