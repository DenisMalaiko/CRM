import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BusinessStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NicheNewsService } from './nicheNews.service';
import { IndustryCategoryMap } from '../../shared/const/IndustryCategoryMap';

type BusinessEntry = {
  id: string;
  industry: string;
  name: string;
  goals: string[];
  advantages: string[];
};

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

    // Intentionally unscoped — cron purges expired news across all tenants
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
        industry: true,
        language: true,
        name: true,
        goals: true,
        advantages: true,
      },
    });

    this.logger.log(`Found ${businesses.length} businesses with industry set`);

    if (businesses.length === 0) return;

    // Group by (category, language) to minimize API calls.
    // Each group holds unique business objects (deduped by businessId)
    // so AI filtering and idea generation run per-business.
    const groupMap = new Map<string, BusinessEntry[]>();
    const seen = new Set<string>();

    for (const biz of businesses) {
      const category = IndustryCategoryMap[biz.industry!];
      if (!category) {
        this.logger.warn(`No category mapping for industry: ${biz.industry}`);
        continue;
      }

      const lang = biz.language === 'ua' ? 'ua' : 'en';
      const fetchKey = `${category}::${lang}`;

      if (seen.has(biz.id)) continue;
      seen.add(biz.id);

      if (!groupMap.has(fetchKey)) {
        groupMap.set(fetchKey, []);
      }
      groupMap.get(fetchKey)!.push({
        id: biz.id,
        industry: biz.industry!,
        name: biz.name,
        goals: biz.goals,
        advantages: biz.advantages,
      });
    }

    let successCount = 0;
    let failCount = 0;

    for (const [fetchKey, bizEntries] of groupMap) {
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

      for (const biz of bizEntries) {
        try {
          const relevantItems =
            await this.nicheNewsService.filterNewsByRelevance(
              {
                name: biz.name,
                industry: biz.industry,
                goals: biz.goals,
                advantages: biz.advantages,
              },
              topItems,
            );
          const saved = await this.nicheNewsService.saveNewsForBusiness(
            biz.id,
            biz.industry,
            relevantItems,
          );
          await this.nicheNewsService.generateIdeasFromNews(
            {
              name: biz.name,
              industry: biz.industry,
              goals: biz.goals,
              advantages: biz.advantages,
            },
            biz.id,
            saved,
          );
          successCount++;
          this.logger.log(
            `Saved ${relevantItems.length} news for business ${biz.id}, industry "${biz.industry}"`,
          );
        } catch (error) {
          failCount++;
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to save news for business ${biz.id}, industry "${biz.industry}": ${message}`,
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
