import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { IndustryCategoryMap } from '../../shared/const/IndustryCategoryMap';
import { type NicheNews } from '@prisma/client';

type NewsItem = {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: Date;
};

type NewsdataArticle = {
  title: string | null;
  link: string | null;
  description: string | null;
  source_name: string | null;
  pubDate: string | null;
};

type NewsdataResponse = {
  status: string;
  totalResults: number;
  results: NewsdataArticle[] | null;
};

@Injectable()
export class NicheNewsService {
  private readonly logger = new Logger(NicheNewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getByBusinessId(businessId: string): Promise<NicheNews[]> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { agencyId: true, industry: true },
    });

    if (!business) throw new NotFoundException('Business not found');

    return this.prisma.nicheNews.findMany({
      where: {
        agencyId: business.agencyId,
        industry: business.industry ?? undefined,
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }

  async fetchByBusinessId(businessId: string): Promise<NicheNews[]> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { agencyId: true, industry: true, language: true },
    });

    if (!business) throw new NotFoundException('Business not found');
    if (!business.industry)
      throw new NotFoundException('Business has no industry set');

    const industry = business.industry;
    const category = IndustryCategoryMap[industry];
    if (!category)
      throw new NotFoundException(
        `No category mapping for industry: ${business.industry}`,
      );

    const lang = business.language === 'ua' ? 'ua' : 'en';
    const items = await this.fetchFromNewsdata(category, lang);
    const topItems = this.selectTopItems(items, 10);
    const startOfToday = this.getStartOfTodayUTC();

    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.nicheNews.deleteMany({
        where: {
          agencyId: business.agencyId,
          industry,
          createdAt: { gte: startOfToday },
        },
      });

      const results: NicheNews[] = [];
      for (const item of topItems) {
        try {
          const record = await tx.nicheNews.upsert({
            where: { url: item.url },
            update: {
              title: item.title,
              summary: item.summary,
              source: item.source,
              publishedAt: item.publishedAt,
            },
            create: {
              agencyId: business.agencyId,
              title: item.title,
              summary: item.summary,
              url: item.url,
              source: item.source,
              industry,
              publishedAt: item.publishedAt,
            },
          });
          results.push(record);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          this.logger.warn(`Failed to save news "${item.title}": ${message}`);
        }
      }
      return results;
    });

    this.logger.log(
      `Fetched ${saved.length} news items for business ${businessId} (industry: ${industry}, lang: ${lang})`,
    );

    return saved;
  }

  private async fetchFromNewsdata(
    category: string,
    lang: string,
  ): Promise<NewsItem[]> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
      this.logger.error('NEWSDATA_API_KEY is not set');
      return [];
    }

    const languageMap: Record<string, string> = { en: 'en', ua: 'uk' };
    const countryMap: Record<string, string> = { en: 'us', ua: 'ua' };

    const params = new URLSearchParams({
      apikey: apiKey,
      language: languageMap[lang],
      country: countryMap[lang],
      category,
      size: '10',
      removeduplicate: '1',
    });

    try {
      const response = await fetch(
        `https://newsdata.io/api/1/latest?${params.toString()}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(
          `Newsdata API returned ${response.status}: ${errorBody}`,
        );
        return [];
      }

      const data: NewsdataResponse = await response.json();

      if (data.status !== 'success' || !data.results) {
        this.logger.warn(`Newsdata API returned status: ${data.status}`);
        return [];
      }

      return data.results
        .filter(
          (
            article,
          ): article is NewsdataArticle & { title: string; link: string } =>
            !!article.title && !!article.link,
        )
        .map((article) => ({
          title: article.title,
          url: article.link,
          summary: article.description ?? '',
          source: article.source_name ?? 'Unknown',
          publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
        }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to fetch from Newsdata: ${message}`);
      return [];
    }
  }

  // --- Google News RSS (disabled, kept for reference) ---

  // private fetchFromGoogleRss(keywords: string[], lang: string): Promise<NewsItem[]> {
  //   const now = new Date();
  //   const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  //   const afterDate = weekAgo.toISOString().split('T')[0];
  //   const beforeDate = now.toISOString().split('T')[0];
  //
  //   const hlMap: Record<string, string> = { en: 'en', ua: 'uk' };
  //   const glMap: Record<string, string> = { en: 'US', ua: 'UA' };
  //   const ceidMap: Record<string, string> = { en: 'US:en', ua: 'UA:uk' };
  //
  //   const allItems: NewsItem[] = [];
  //
  //   for (const keyword of keywords) {
  //     const q = `intitle:${encodeURIComponent(keyword)}+after:${afterDate}+before:${beforeDate}`;
  //     const url = `https://news.google.com/rss/search?q=${q}&hl=${hlMap[lang]}&gl=${glMap[lang]}&ceid=${ceidMap[lang]}`;
  //     // ... RSS parsing logic
  //   }
  //
  //   return this.deduplicateByUrl(allItems);
  // }

  private selectTopItems(items: NewsItem[], count: number): NewsItem[] {
    return [...items]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, count);
  }

  private getStartOfTodayUTC(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }
}
