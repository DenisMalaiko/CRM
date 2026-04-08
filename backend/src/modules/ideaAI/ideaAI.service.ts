import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../../core/prisma/prisma.service";
import {AiService} from "../ai/ai.service";
import {TIdeaAI, TIdeaAIUpdate} from "./entities/ideaAI.entity";


@Injectable()
export class IdeaAIService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async fetchIdeas(businessId: string) {
    console.log("FETCH IDEAS SERVICE")
    console.log(businessId)
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        website: true,
        industry: true,
        status: true,
        language: true,
        brand: true,
        advantages: true,
        goals: true,
        products: true,
      }
    });

    const ideasAI = await this.prisma.ideaAI.findMany({
      where: { businessId: businessId },
      select: {
        title: true,
        description: true,
      }
    })

    const ideas = await this.aiService.generateIdeas(business, ideasAI);

    return await Promise.allSettled(
      ideas.map((idea) =>
        this.prisma.ideaAI.create({
          data: {
            title: idea.title,
            description: idea.description,
            who: idea.who,
            what: idea.what,
            why: idea.why,
            how: idea.how,
            feeling: idea.feeling,
            businessId: businessId,
          }
        })
      )
    );
  }

  async getIdeas(businessId: string) {
    return await this.prisma.ideaAI.findMany({
      where: {businessId: businessId}
    });
  }

  async updateIdea(id: string, body: TIdeaAIUpdate): Promise<TIdeaAI> {
    if (!id) {
      throw new NotFoundException('Idea ID is required');
    }

    try {
      return await this.prisma.ideaAI.update({
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
      return await this.prisma.ideaAI.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Idea with ID ${id} not found`);
      }
      throw err;
    }
  }
}