import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { S3Service } from '../../core/s3/s3.service';
import { StorageUrlService } from '../../core/storage/storage-url.service';

@Injectable()
export class CompetitorMediaService {
  private readonly logger = new Logger(CompetitorMediaService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly storageUrlService: StorageUrlService,
  ) {}

  async processMedia(competitorId: string, media: any[]): Promise<any[]> {
    if (!Array.isArray(media) || media.length === 0) return [];

    const results = await Promise.allSettled(
      media.map(item => this.processMediaItem(competitorId, item))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);
  }

  private async processMediaItem(competitorId: string, item: any): Promise<any> {
    const processed = { ...item };

    if (item.thumbnail && !this.isS3Url(item.thumbnail)) {
      processed.thumbnail = await this.downloadAndUpload(competitorId, item.thumbnail);
    }

    if (item.url && !this.isS3Url(item.url)) {
      processed.url = await this.downloadAndUpload(competitorId, item.url);
    }

    return processed;
  }

  private async downloadAndUpload(competitorId: string, sourceUrl: string): Promise<string> {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      this.logger.warn(`Failed to download media: ${sourceUrl} (${response.status})`);
      return sourceUrl;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const ext = this.getExtension(contentType, sourceUrl);
    const key = `competitors/${competitorId}/media/${randomUUID()}.${ext}`;

    await this.s3Service.upload(key, buffer, contentType);

    return this.storageUrlService.getPublicUrl(key);
  }

  extractS3Key(url: string): string | null {
    const baseUrl = process.env.ASSETS_BASE_URL;
    if (!baseUrl || !url.startsWith(baseUrl)) return null;
    return url.slice(baseUrl.length + 1);
  }

  async deleteMedia(key: string): Promise<void> {
    await this.s3Service.delete(key);
  }

  private isS3Url(url: string): boolean {
    if (!url) return false;
    const baseUrl = process.env.ASSETS_BASE_URL;
    return !!baseUrl && url.startsWith(baseUrl);
  }

  private getExtension(contentType: string, url: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
    };

    if (mimeMap[contentType]) return mimeMap[contentType];

    try {
      const pathname = new URL(url).pathname;
      const match = pathname.match(/\.(\w{2,5})$/);
      if (match) return match[1];
    } catch {}

    return 'jpg';
  }
}
