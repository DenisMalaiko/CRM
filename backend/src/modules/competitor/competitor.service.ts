import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TCompetitor, TCompetitorCreate, TCompetitorUpdate } from "./entities/competitor.entity";
import * as process from "node:process";

@Injectable()
export class CompetitorService {
  private readonly serpApiKey: string = process.env.SERP_API_KEY!;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getCompetitors(businessId: string): Promise<TCompetitor[]> {
    return await this.prisma.competitor.findMany({
      where: { businessId: businessId },
    });
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

    if(competitor && competitor.facebookLink) {
      const facebookProfileId = new URL(competitor.facebookLink).searchParams.get('id');
      console.log(`Facebook profileId: ${facebookProfileId}`);
      console.log("API KEY ", this.serpApiKey)

      if (!facebookProfileId) {
        throw new BadRequestException('Facebook profile id not found in link');
      }

      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'facebook_profile');
      url.searchParams.set('profile_id', facebookProfileId);
      url.searchParams.set('api_key', this.serpApiKey!);

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log("DATA ", data.profile_results);
      console.log("PHOTOS ", data.profile_results.photos);

      return data;
    }
  }
}