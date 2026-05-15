import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TiktokService } from '../tiktok/tiktok.service';
import { type TiktokVideo } from '@prisma/client';

@Injectable()
export class TrendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiktokService: TiktokService,
  ) {}

  async getTikTokVideosByBusinessId(businessId: string): Promise<TiktokVideo[] | null> {
    return await this.prisma.tiktokVideo.findMany({
      where: { businessId: businessId },
    });
  }

  async fetchTikTokVideosByBusinessId(businessId: string): Promise<TiktokVideo[] | null> {
    return await this.tiktokService.fetchTikTokVideosByBusinessId(businessId);
  }
}
