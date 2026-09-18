import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { IndustryKeywords } from '../../shared/const/IndustryKeywords';
import { type NicheNews } from '@prisma/client';

type RssItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
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
    if (!business.industry) throw new NotFoundException('Business has no industry set');

    const keywordsMap = IndustryKeywords[business.industry];
    if (!keywordsMap) throw new NotFoundException(`No keywords for industry: ${business.industry}`);

    const lang = business.language === 'ua' ? 'ua' : 'en';
    const keywords = keywordsMap[lang];

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const afterDate = weekAgo.toISOString().split('T')[0];
    const beforeDate = now.toISOString().split('T')[0];

    const hlMap: Record<string, string> = { en: 'en', ua: 'uk' };
    const glMap: Record<string, string> = { en: 'US', ua: 'UA' };
    const ceidMap: Record<string, string> = { en: 'US:en', ua: 'UA:uk' };

    const allItems: RssItem[] = [];

    for (const keyword of keywords) {
      try {
        const q = `intitle:${encodeURIComponent(keyword)}+after:${afterDate}+before:${beforeDate}`;
        const url = `https://news.google.com/rss/search?q=${q}&hl=${hlMap[lang]}&gl=${glMap[lang]}&ceid=${ceidMap[lang]}`;

        const response = await fetch(url);
        if (!response.ok) {
          this.logger.warn(`RSS fetch failed for "${keyword}": ${response.status}`);
          continue;
        }

        const xml = await response.text();
        const items = this.parseRssXml(xml);
        allItems.push(...items);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to fetch RSS for "${keyword}": ${message}`);
      }
    }

    const uniqueItems = this.deduplicateByUrl(allItems);

    const saved: NicheNews[] = [];
    for (const item of uniqueItems) {
      try {
        const record = await this.prisma.nicheNews.upsert({
          where: { url: item.url },
          update: {},
          create: {
            agencyId: business.agencyId,
            title: item.title,
            summary: '',
            url: item.url,
            source: item.source,
            industry: business.industry,
            publishedAt: item.publishedAt,
          },
        });
        saved.push(record);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to save news "${item.title}": ${message}`);
      }
    }

    this.logger.log(`Fetched ${saved.length} news items for business ${businessId} (industry: ${business.industry}, lang: ${lang})`);

    return this.getByBusinessId(businessId);
  }

  private parseRssXml(xml: string): RssItem[] {
    const items: RssItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];

      const title = this.extractTag(itemXml, 'title');
      const link = this.extractTag(itemXml, 'link');
      const pubDate = this.extractTag(itemXml, 'pubDate');
      const source = this.extractTag(itemXml, 'source');

      if (title && link) {
        items.push({
          title: this.decodeHtmlEntities(title),
          url: link,
          source: source ? this.decodeHtmlEntities(source) : 'Google News',
          publishedAt: pubDate ? new Date(pubDate) : new Date(),
        });
      }
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
    const match = regex.exec(xml);
    return match ? match[1].trim() : null;
  }

  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  private deduplicateByUrl(items: RssItem[]): RssItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }
}
