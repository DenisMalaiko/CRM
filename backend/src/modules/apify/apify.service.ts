import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ApifyClient } from 'apify-client';
import * as process from 'node:process';

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);

  private readonly client = new ApifyClient({
    token: process.env.APIFY_API_KEY!,
    maxRetries: 8, // ретраї на 5xx/429/мережеві фейли з експоненційним backoff
  });

  async runActor<T>(actor: string, input: any): Promise<T[]> {
    this.logger.log(`Starting Apify actor: ${actor}`);

    let run;
    try {
      run = await this.client.actor(actor).call(input, {
        // Можеш налаштувати під свої потреби:
        // timeout: 600,    // макс. час виконання в секундах
        // memory: 2048,    // МБ оперативки для actor'а
        // waitSecs: 600,   // макс. час очікування завершення на стороні клієнта
      });
    } catch (err: any) {
      this.logger.error(`Apify actor start failed: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to run actor');
    }

    if (run.status !== 'SUCCEEDED') {
      this.logger.error(`Apify run ${run.id} ended with status ${run.status}`);
      throw new BadRequestException(`Apify run ${run.status.toLowerCase()}`);
    }

    this.logger.log(`Apify run ${run.id} succeeded, fetching dataset`);

    const { items } = await this.client
      .dataset(run.defaultDatasetId)
      .listItems();

    if (!Array.isArray(items) || items.length === 0) {
      this.logger.warn(
        `Apify run ${run.id} for actor "${actor}" returned an empty dataset despite SUCCEEDED status`,
      );
      return [];
    }

    const first = items[0] as any;
    if (first?.error) {
      if (first.errorCode === 'PAGE_PRIVATE') {
        throw new BadRequestException('Page is private');
      }
      if (first.errorCode === 'ADS_NOT_FOUND') {
        throw new BadRequestException('Ads not found');
      }
      throw new BadRequestException('No data found for this page');
    }

    return items as T[];
  }
}
