import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TTrend, TTrendCreate, TTrendMatch, TTrendUpdate } from './entities/trend.entity';
import { TrendFilterDto } from './dto/trend.dto';

@Injectable()
export class TrendsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTrend(data: TTrendCreate): Promise<TTrend> {
    return this.prisma.trend.create({ data: data as any }) as Promise<TTrend>;
  }

  async getTrends(filter: TrendFilterDto): Promise<TTrend[]> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filter.businessId) {
      where.businessId = filter.businessId;
    }

    if (filter.platformId) {
      where.platformId = filter.platformId;
    }

    return this.prisma.trend.findMany({
      where,
      skip,
      take: limit,
    }) as Promise<TTrend[]>;
  }

  async getTrend(id: string): Promise<TTrend> {
    const trend = await this.prisma.trend.findUnique({ where: { id } });

    if (!trend) {
      throw new NotFoundException(`Trend with ID ${id} not found`);
    }

    return trend as TTrend;
  }

  async updateTrend(id: string, data: TTrendUpdate): Promise<TTrend> {
    try {
      return await this.prisma.trend.update({ where: { id }, data: data as any }) as TTrend;
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Trend with ID ${id} not found`);
      }
      throw err;
    }
  }

  async deleteTrend(id: string): Promise<TTrend> {
    try {
      return await this.prisma.trend.delete({ where: { id } }) as TTrend;
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Trend with ID ${id} not found`);
      }
      throw err;
    }
  }

  async matchProfileTrends(profileId: string): Promise<{}> {
    return {};
  }

  async getProfileTrends(profileId: string): Promise<(TTrendMatch & { trend: TTrend })[]> {
    return this.prisma.businessTrendMatch.findMany({
      where: { businessProfileId: profileId },
      include: { trend: true },
      orderBy: { relevanceScore: 'desc' },
    }) as Promise<(TTrendMatch & { trend: TTrend })[]>;
  }
}
