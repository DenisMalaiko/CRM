import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FacebookService } from "../facebook/facebook.service";
import { TCompetitor, TCompetitorCreate, TCompetitorUpdate } from "./entities/competitor.entity";

@Injectable()
export class CompetitorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookService: FacebookService,
  ) {}

  async getCompetitors(businessId: string): Promise<TCompetitor[]> {
    return await this.prisma.competitor.findMany({
      where: { businessId: businessId },
    });
  }

  async getCompetitor(id: string): Promise<TCompetitor | null> {
    const competitor =  await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor) return null;

    return competitor;
  }

  async createCompetitor(body: TCompetitorCreate): Promise<TCompetitor> {
    return await this.prisma.competitor.create({
      data: body
    });
  }

  async updateCompetitor(id: string, body: TCompetitorUpdate): Promise<TCompetitor> {
    if (!id) throw new NotFoundException('Competitor ID is required');

    try {
      return await this.prisma.competitor.update({
        where: {id},
        data: {
          name: body.name,
          facebookLink: body.facebookLink,
          isActive: body.isActive,
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update competitor');
    }
  }

  async deleteCompetitor(id: string): Promise<TCompetitor> {
    try {
      return await this.prisma.competitor.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }
      throw err;
    }
  }

  async generateReport(id: string): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor?.facebookLink) return null;

    const [posts] = await Promise.all([
      this.facebookService.fetchAds(competitor.facebookLink),
      //this.facebookService.fetchPosts(competitor.facebookLink),
    ]);

    //console.log("ADS ", ads);
    console.log("POSTS ", posts);

    return { posts };
  }
}