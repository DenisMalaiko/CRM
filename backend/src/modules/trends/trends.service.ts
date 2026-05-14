import { Injectable, NotFoundException } from '@nestjs/common';
import { Tag, TagSource, TagType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TiktokService } from '../tiktok/tiktok.service';
import { TTrend, TTrendCreate, TTrendMatch, TTrendUpdate } from './entities/trend.entity';
import { TrendFilterDto } from './dto/trend.dto';

@Injectable()
export class TrendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiktokService: TiktokService,
  ) {}

  async getTrendVideos(businessId: string): Promise<any[]> {
    /*const tags = await this.getHashtagsByBusinessId(businessId);
    if (!tags || tags.length === 0) return [];
    const hashtagValues = tags.map((tag) => tag.value);*/

    const hashtagValues = [
      'мійвсесвіт💕', 'доня'
    ];

    if (hashtagValues.length === 0) return [];

    console.log("HASHTAG VALUES", hashtagValues);

    const videos: any[] = await this.getVideosByHashtags(businessId, hashtagValues);

    if (videos.length === 0) return [];

    await this.saveTiktokVideos(videos, businessId);

    console.log("-----------------------");
    console.log("VIDEOS", videos);

    return videos;
  }

  async getHashtagsByBusinessId(id: string): Promise<Tag[] | null> {
    const business = await this.prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        industry: true,
        language: true,
        country: true,
      },
    });

    if (!business) return null;

    const hashtags = await this.tiktokService.fetchHashtags(
      id,
      business.country,
      business.industry,
    );

    return Promise.all(hashtags.map((h: any) => this._upsertHashtag(h)));
  }

  async getVideosByHashtags(businessId: string, hashtags: string[]): Promise<any[]> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { country: true },
    });

    if (!business) return [];

    return this.tiktokService.fetchVideosByHashtags(hashtags, business.country);
  }

  private async saveTiktokVideos(videos: any[], businessId: string) {
    const data = videos.map(v => ({
      ...v,
      businessId,
    }));

    const result = await this.prisma.tiktokVideo.createMany({
      data,
      skipDuplicates: true,
    });

    return result;
  }



  private async _upsertHashtag(h: { name: string; countryCode: string; industry: string; rank: number; url: string }): Promise<Tag> {
    const normalizedValue = h.name.toLowerCase();

    const tag = await this.prisma.tag.upsert({
      where: { type_normalizedValue: { type: TagType.Hashtag, normalizedValue } },
      create: {
        type: TagType.Hashtag,
        value: h.name,
        normalizedValue,
        source: TagSource.Trend,
        countries: h.countryCode ? [h.countryCode] : [],
        industries: h.industry ? [h.industry] : [],
        metrics: { rank: h.rank, url: h.url },
      },
      update: {
        metrics: { rank: h.rank, url: h.url },
      },
    });

    const needsUpdate =
      (h.countryCode && !tag.countries.includes(h.countryCode)) ||
      (h.industry && !tag.industries.includes(h.industry));

    if (!needsUpdate) return tag;

    return this.prisma.tag.update({
      where: { id: tag.id },
      data: {
        countries: { set: Array.from(new Set([...tag.countries, h.countryCode].filter(Boolean))) },
        industries: { set: Array.from(new Set([...tag.industries, h.industry].filter(Boolean))) },
      },
    });
  }

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
