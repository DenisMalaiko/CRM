import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { IndustryCategoryMap } from '../../shared/const/IndustryCategoryMap';
import { type NicheNews } from '@prisma/client';
import { AiBaseService, AiModel } from '../ai/services/ai-base.service';
import { NewsRelevanceSchema } from './schema/news-relevance.schema';
import { NewsIdeasSchema } from './schema/news-ideas.schema';
import {
  newsFilterRoleBlock,
  newsFilterContextBlock,
  newsFilterArticlesBlock,
  newsFilterTaskBlock,
  newsFilterOutputBlock,
  type NewsFilterBusinessContext,
} from '../ai/prompts/nicheNews/news-relevance';
import {
  newsIdeasRoleBlock,
  newsIdeasContextBlock,
  newsIdeasArticlesBlock,
  newsIdeasTaskBlock,
  newsIdeasOutputBlock,
  type NewsIdeasBusinessContext,
} from '../ai/prompts/nicheNews/news-ideas';

export type NewsItem = {
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
  nextPage: string | null;
};

@Injectable()
export class NicheNewsService {
  private readonly logger = new Logger(NicheNewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiBase: AiBaseService,
  ) {}

  async getByBusinessId(
    businessId: string,
    agencyId: string,
  ): Promise<NicheNews[]> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { agencyId: true },
    });

    if (!business || business.agencyId !== agencyId)
      throw new NotFoundException('Business not found');

    return this.prisma.nicheNews.findMany({
      where: { businessId },
      include: {
        ideasAI: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }

  async fetchByBusinessId(
    businessId: string,
    agencyId: string,
  ): Promise<NicheNews[]> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        agencyId: true,
        industry: true,
        language: true,
        name: true,
        goals: true,
        advantages: true,
        brand: true,
        products: {
          where: { isActive: true },
          select: { name: true, description: true, type: true },
        },
        businessProfiles: {
          where: { isActive: true },
          select: {
            audiences: {
              select: {
                targetAudience: {
                  select: {
                    name: true,
                    pains: true,
                    desires: true,
                    interests: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!business || business.agencyId !== agencyId)
      throw new NotFoundException('Business not found');
    if (!business.industry)
      throw new NotFoundException('Business has no industry set');

    const industry = business.industry;
    const category = IndustryCategoryMap[industry];
    if (!category)
      throw new NotFoundException(
        `No category mapping for industry: ${business.industry}`,
      );

    const audiences = business.businessProfiles
      .flatMap((p) => p.audiences.map((a) => a.targetAudience))
      .filter((a, i, arr) => arr.findIndex((x) => x.name === a.name) === i);

    const filterContext: NewsFilterBusinessContext = {
      name: business.name,
      industry,
      goals: business.goals,
      advantages: business.advantages,
      products: business.products.map((p) => ({ name: p.name, type: p.type })),
    };

    const ideasContext: NewsIdeasBusinessContext = {
      name: business.name,
      industry,
      goals: business.goals,
      advantages: business.advantages,
      brand: business.brand || undefined,
      products: business.products,
      audiences,
    };

    const lang = business.language === 'ua' ? 'ua' : 'en';
    const items = await this.fetchFromNewsdata(category, lang);
    const relevantItems = await this.filterNewsByRelevance(
      filterContext,
      items,
    );

    const saved = await this.saveNewsForBusiness(
      businessId,
      industry,
      relevantItems,
    );

    this.logger.log(
      `Fetched ${saved.length} news items for business ${businessId} (industry: ${industry}, lang: ${lang})`,
    );

    await this.generateIdeasFromNews(ideasContext, businessId, saved);

    return this.getByBusinessId(businessId, agencyId);
  }

  async filterNewsByRelevance(
    business: NewsFilterBusinessContext,
    items: NewsItem[],
  ): Promise<NewsItem[]> {
    if (items.length === 0) return [];

    try {
      const model = this.aiBase.getModel(AiModel.Fast);
      const prompt = [
        newsFilterRoleBlock(),
        newsFilterContextBlock(business),
        newsFilterArticlesBlock(items),
        newsFilterTaskBlock(),
        newsFilterOutputBlock(),
      ].join('\n\n');

      const response = await model.invoke(prompt);
      const rawText = this.aiBase.extractTextContent(response.content);
      const parsed = NewsRelevanceSchema.parse(
        this.aiBase.safeParseJson(rawText),
      );

      const filtered = parsed.relevantIndexes
        .filter((i) => i >= 0 && i < items.length)
        .map((i) => items[i]);

      this.logger.log(
        `AI filter: ${items.length} → ${filtered.length} relevant`,
      );
      return filtered;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`AI news filter failed, keeping all items: ${message}`);
      return items;
    }
  }

  async saveNewsForBusiness(
    businessId: string,
    industry: string,
    items: NewsItem[],
  ): Promise<NicheNews[]> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      await tx.nicheNews.deleteMany({
        where: {
          businessId,
          industry,
          createdAt: { lt: threeDaysAgo },
        },
      });

      const results: NicheNews[] = [];
      for (const item of items) {
        try {
          const record = await tx.nicheNews.upsert({
            where: { businessId_url: { businessId, url: item.url } },
            update: {
              title: item.title,
              summary: item.summary,
              source: item.source,
              publishedAt: item.publishedAt,
            },
            create: {
              businessId,
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
  }

  async generateIdeasFromNews(
    business: NewsIdeasBusinessContext,
    businessId: string,
    savedNews: NicheNews[],
  ): Promise<void> {
    if (savedNews.length === 0) return;

    try {
      const model = this.aiBase.getModel(AiModel.Creative);
      const prompt = [
        newsIdeasRoleBlock(),
        newsIdeasContextBlock(business),
        newsIdeasArticlesBlock(
          savedNews.map((n) => ({ title: n.title, summary: n.summary })),
        ),
        newsIdeasTaskBlock(),
        newsIdeasOutputBlock(),
      ].join('\n\n');

      const response = await model.invoke(prompt);
      const rawText = this.aiBase.extractTextContent(response.content);
      const parsed = NewsIdeasSchema.parse(this.aiBase.safeParseJson(rawText));

      const validIdeas = parsed.ideas.filter(
        (idea) => idea.newsIndex >= 0 && idea.newsIndex < savedNews.length,
      );

      const created = await this.prisma.$transaction(
        validIdeas.map((idea) =>
          this.prisma.ideaAI.create({
            data: {
              businessId,
              nicheNewsId: savedNews[idea.newsIndex].id,
              title: idea.title,
              description: idea.description,
              who: idea.who,
              what: idea.what,
              why: idea.why,
              how: idea.how,
              feeling: idea.feeling,
            },
          }),
        ),
      );

      this.logger.log(
        `Generated ${created.length} ideas from ${savedNews.length} news articles`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to generate ideas from news: ${message}`);
    }
  }

  async fetchFromNewsdata(
    category: string,
    lang: string,
    maxPages = 5,
  ): Promise<NewsItem[]> {
    const apiKey = process.env.NEWSDATA_API_KEY;
    if (!apiKey) {
      this.logger.error('NEWSDATA_API_KEY is not set');
      return [];
    }

    const languageMap: Record<string, string> = { en: 'en', ua: 'uk' };
    const countryMap: Record<string, string> = { en: 'us', ua: 'ua' };

    const allItems: NewsItem[] = [];
    let nextPage: string | null = null;
    let pagesVisited = 0;

    for (let page = 1; page <= maxPages; page++) {
      try {
        const params = new URLSearchParams({
          apikey: apiKey,
          language: languageMap[lang],
          country: countryMap[lang],
          category,
          size: '10',
          removeduplicate: '1',
        });

        if (nextPage) {
          params.set('page', nextPage);
        }

        const response = await fetch(
          `https://newsdata.io/api/1/latest?${params.toString()}`,
        );

        if (!response.ok) {
          const errorBody = await response.text();
          this.logger.warn(
            `Newsdata API returned ${response.status}: ${errorBody}`,
          );
          break;
        }

        const data: NewsdataResponse = await response.json();

        if (data.status !== 'success' || !data.results) {
          this.logger.warn(`Newsdata API returned status: ${data.status}`);
          break;
        }

        const items = data.results
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
            publishedAt: article.pubDate
              ? new Date(article.pubDate)
              : new Date(),
          }));

        allItems.push(...items);
        pagesVisited++;
        nextPage = data.nextPage;

        if (!nextPage) break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to fetch from Newsdata: ${message}`);
        break;
      }
    }

    this.logger.log(
      `Newsdata: fetched ${allItems.length} articles across ${pagesVisited} page(s) for ${category}/${lang}`,
    );

    return allItems;
  }

  selectTopItems(items: NewsItem[], count: number): NewsItem[] {
    return [...items]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, count);
  }
}
