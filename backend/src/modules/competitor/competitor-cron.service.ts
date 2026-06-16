import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CompetitorService } from './competitor.service';

@Injectable()
export class CompetitorCronService {
  private readonly logger = new Logger(CompetitorCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly competitorService: CompetitorService,
  ) {}

  // @Cron('*/5 * * * *')
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCompetitorDataCron(): Promise<void> {
    this.logger.log('Starting daily competitor data fetch...');

    // Intentionally unscoped — cron processes all active competitors
    const competitors = await this.prisma.competitor.findMany({
      where: { isActive: true },
      select: { id: true, name: true, facebookLink: true, instagramLink: true },
    });

    this.logger.log(`Found ${competitors.length} active competitors`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const postParams = {
      onlyPostsNewerThan: thirtyDaysAgo.toISOString().split('T')[0],
    };
    const adsParams = {
      activeStatus: 'all',
      period: '',
      sortBy: 'most_recent',
    };

    let successCount = 0;
    let failCount = 0;

    for (const competitor of competitors) {
      const tasks: { name: string; fn: () => Promise<any> }[] = [];

      if (competitor.facebookLink) {
        tasks.push({
          name: 'Facebook Posts',
          fn: () =>
            this.competitorService.fetchPosts(competitor.id, postParams),
        });
        tasks.push({
          name: 'Facebook Ads',
          fn: () => this.competitorService.fetchAds(competitor.id, adsParams),
        });
      }

      if (competitor.instagramLink) {
        tasks.push({
          name: 'Instagram Posts',
          fn: () =>
            this.competitorService.fetchInstagramPosts(
              competitor.id,
              postParams,
            ),
        });
        tasks.push({
          name: 'Instagram Reels',
          fn: () =>
            this.competitorService.fetchInstagramReels(
              competitor.id,
              postParams,
            ),
        });
      }

      for (const task of tasks) {
        try {
          await task.fn();
          successCount++;
          this.logger.log(
            `${task.name} fetched for "${competitor.name}" (${competitor.id})`,
          );
        } catch (error) {
          failCount++;
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to fetch ${task.name} for "${competitor.name}" (${competitor.id}): ${message}`,
          );
        }
      }
    }

    this.logger.log(
      `Daily competitor fetch completed: ${successCount} succeeded, ${failCount} failed`,
    );
  }
}
