import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TCompetitor, TCompetitorCreate, TCompetitorUpdate } from "./entities/competitor.entity";
import * as process from "node:process";

export interface FacebookPost {
  text: string;
  publishedAt?: string;
}


@Injectable()
export class CompetitorService {
  private readonly serpApiKey: string = process.env.SERP_API_KEY!;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getCompetitors(businessId: string): Promise<TCompetitor[]> {
    return await this.prisma.competitor.findMany({
      where: { businessId: businessId },
    });
  }

  async createCompetitor(body: TCompetitorCreate): Promise<TCompetitor> {
    return await this.prisma.competitor.create({
      data: body
    });
  }

  async updateCompetitor(id: string, body: TCompetitorUpdate): Promise<TCompetitor> {
    if (!id) throw new NotFoundException('Competitor ID is required');

    try {
      return await this.prisma.competitor.update({
        where: {id},
        data: {
          name: body.name,
          facebookLink: body.facebookLink,
          isActive: body.isActive,
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update competitor');
    }
  }

  async deleteCompetitor(id: string): Promise<TCompetitor> {
    try {
      return await this.prisma.competitor.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }
      throw err;
    }
  }

  async generateReport(id: string): Promise<any> {
    console.log("111")
    const competitor = await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (competitor && competitor.facebookLink) {
      console.log("222")
      const limit = 20;
      const pageUrl = "https://www.facebook.com/people/Klarid/61565845894593";

      const { chromium } = await import('playwright');

      console.log("333")
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      });

      console.log("444")
      await page.goto(pageUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      console.log("555")

      // Даємо Facebook завантажити JS
      await page.waitForTimeout(4000);

      const html = await page.evaluate(() => document.body.innerHTML);
      console.log('DOM SNAPSHOT START');
      console.log(html.slice(0, 5000)); // не весь, інакше вбʼє логи
      console.log('DOM SNAPSHOT END');



      try {
        await page.getByRole('button', {
          name: /(allow|accept|zezw[oó]l|rozwi[aą]ż|разреш)/i,
        }).click({ timeout: 5000 });

        console.log("COOKIE ACCEPTED");
        await page.waitForTimeout(3000);
      } catch {
        console.log("NO COOKIE POPUP OR ALREADY ACCEPTED");
      }


      console.log("MODAL CHECK");

      try {
        await page.getByRole('button', {
          name: /(закрыть|zamknij|close|zamknąć)/i,
        }).click({ timeout: 5000 });

        console.log("MODAL CLOSED");
        await page.waitForTimeout(3000);
      } catch {
        console.log("NO MODAL TO CLOSE");
      }



      const posts: FacebookPost[] = [];

      console.log("666")

      const maxScrolls = 8;

      // 🔑 ВАЖЛИВО: рахуємо пів екрана
      const halfScreenHeight = await page.evaluate(
        () => window.innerHeight / 2
      );

      console.log("SCROLL HEIGHT:", halfScreenHeight);

      for (let scroll = 0; scroll < maxScrolls; scroll++) {
        console.log("777", "SCROLL:", scroll + 1)

        const newPosts = await page.$$eval(
          'div[role="article"]',
          elements =>
            elements.map((el: any) => ({
              text: el.innerText,
            })),
        );

        console.log("888", "FOUND:", newPosts.length)
        console.log("POST ", newPosts)

        let added = 0;

        for (const post of newPosts) {
          if (
            post.text &&
            post.text.length > 50 &&
            !posts.some(p => p.text === post.text)
          ) {
            posts.push(post);
            added++;
          }
        }

        console.log("999", "ADDED:", added, "TOTAL:", posts.length)

        if (posts.length >= limit) {
          console.log("LIMIT REACHED");
          break;
        }

        // 🔽 ПІВ ЕКРАНА (людський scroll)
        await page.mouse.wheel(0, halfScreenHeight);

        console.log("100", "SCROLLED")

        await page.waitForTimeout(2000 + Math.random() * 1000);

        console.log("1000", "WAIT DONE")

        // 🛑 safety: якщо нічого не додалось — далі нема сенсу
        if (added === 0) {
          console.log("NO NEW POSTS — STOP SCROLLING");
          break;
        }
      }

      console.log("CLOSE");

      await browser.close();

      console.log("POSTS ", posts);

      return posts.slice(0, limit);
    }
  }

/*  async generateReport(id: string): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id }
    });

    if(competitor && competitor.facebookLink) {
      const facebookProfileId = new URL(competitor.facebookLink).searchParams.get('id');
      console.log(`Facebook profileId: ${facebookProfileId}`);
      console.log("API KEY ", this.serpApiKey)

      if (!facebookProfileId) {
        throw new BadRequestException('Facebook profile id not found in link');
      }

      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'facebook_profile');
      url.searchParams.set('profile_id', facebookProfileId);
      url.searchParams.set('api_key', this.serpApiKey!);

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log("DATA ", data.profile_results);
      console.log("PHOTOS ", data.profile_results.photos);

      return data;
    }
  }*/
}