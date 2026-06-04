import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TiktokService } from '../tiktok/tiktok.service';
import { type TiktokVideo, BusinessStatus } from '@prisma/client';

@Injectable()
export class TrendsService {
  private readonly logger = new Logger(TrendsService.name);

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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTikTokVideosCron(): Promise<void> {
    this.logger.log('Starting daily TikTok videos fetch...');

    // Intentionally unscoped — cron processes all active businesses across all agencies
    const businesses = await this.prisma.business.findMany({
      where: { status: BusinessStatus.Active },
      select: { id: true, name: true },
    });

    this.logger.log(`Found ${businesses.length} active businesses`);

    let successCount = 0;
    let failCount = 0;

    for (const business of businesses) {
      try {
        await this.tiktokService.fetchTikTokVideosByBusinessId(business.id);
        successCount++;
        this.logger.log(`Fetched TikTok videos for "${business.name}" (${business.id})`);
      } catch (error) {
        failCount++;
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to fetch TikTok videos for "${business.name}" (${business.id}): ${message}`,
        );
      }
    }

    this.logger.log(
      `Daily TikTok fetch completed: ${successCount} succeeded, ${failCount} failed out of ${businesses.length}`,
    );
  }
}
