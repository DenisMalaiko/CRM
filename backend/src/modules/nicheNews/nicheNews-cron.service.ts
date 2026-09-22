import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BusinessStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NicheNewsService } from './nicheNews.service';
import { IndustryCategoryMap } from '../../shared/const/IndustryCategoryMap';

@Injectable()
export class NicheNewsCronService {
  private readonly logger = new Logger(NicheNewsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nicheNewsService: NicheNewsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNicheNewsCron(): Promise<void> {
    this.logger.log('Starting daily niche news fetch...');

    // Remove news older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const { count: deletedCount } = await this.prisma.nicheNews.deleteMany({
      where: { createdAt: { lt: threeDaysAgo } },
    });
    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} news older than 3 days`);
    }

    // Intentionally unscoped — cron processes all active businesses
    const businesses = await this.prisma.business.findMany({
      where: {
        status: BusinessStatus.Active,
        industry: { not: null },
      },
      select: {
        id: true,
        agencyId: true,
        industry: true,
        language: true,
      },
    });

    this.logger.log(`Found ${businesses.length} businesses with industry set`);

    if (businesses.length === 0) return;

    // Group by (category, language) to minimize API calls.
    // Each group maps to a set of unique (agencyId, industry) pairs to save news for.
    const groupMap = new Map<string, Set<string>>();

    for (const biz of businesses) {
      const category = IndustryCategoryMap[biz.industry!];
      if (!category) {
        this.logger.warn(`No category mapping for industry: ${biz.industry}`);
        continue;
      }

      const lang = biz.language === 'ua' ? 'ua' : 'en';
      const fetchKey = `${category}::${lang}`;
      const saveKey = `${biz.agencyId}::${biz.industry!}`;

      if (!groupMap.has(fetchKey)) {
        groupMap.set(fetchKey, new Set());
      }
      groupMap.get(fetchKey)!.add(saveKey);
    }

    let successCount = 0;
    let failCount = 0;

    for (const [fetchKey, saveKeys] of groupMap) {
      const [category, lang] = fetchKey.split('::');

      const items = await this.nicheNewsService.fetchFromNewsdata(
        category,
        lang,
      );
      const topItems = this.nicheNewsService.selectTopItems(items, 5);

      if (topItems.length === 0) {
        this.logger.warn(`No news found for ${fetchKey}`);
        continue;
      }

      for (const saveKey of saveKeys) {
        const separatorIndex = saveKey.indexOf('::');
        const agencyId = saveKey.slice(0, separatorIndex);
        const industry = saveKey.slice(separatorIndex + 2);

        try {
          await this.nicheNewsService.saveNewsForIndustry(
            agencyId,
            industry,
            topItems,
          );
          successCount++;
          this.logger.log(
            `Saved ${topItems.length} news for agency ${agencyId}, industry "${industry}"`,
          );
        } catch (error) {
          failCount++;
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to save news for agency ${agencyId}, industry "${industry}": ${message}`,
          );
        }
      }

      // Rate limiting between API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.log(
      `Daily niche news fetch completed: ${successCount} succeeded, ${failCount} failed`,
    );
  }
}
