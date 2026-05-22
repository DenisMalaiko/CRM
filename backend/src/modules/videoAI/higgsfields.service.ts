import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../core/s3/s3.service';
import { randomUUID } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createHiggsfieldClient } = require('@higgsfield/client/v2');

interface HiggsfieldsVideoResponse {
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw';
  request_id: string;
  video?: { url: string };
}

interface HiggsfieldsClient {
  subscribe(endpoint: string, options: { input: Record<string, unknown>; withPolling?: boolean }): Promise<HiggsfieldsVideoResponse>;
}

export interface HiggsfieldsResult {
  id: string;
  status: string;
  resultUrl: string;
}

@Injectable()
export class HiggsfieldsService {
  private readonly logger = new Logger(HiggsfieldsService.name);
  private readonly client: HiggsfieldsClient;

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('HIGGSFIELD_API_KEY');
    const apiSecret = this.configService.getOrThrow<string>(
      'HIGGSFIELD_API_KEY_SECRET',
    );

    this.client = createHiggsfieldClient({
      credentials: `${apiKey}:${apiSecret}`,
      maxPollTime: 10 * 60 * 1000,
    });
  }

  async generateVideo(params: {
    prompt: string;
    sourceUrl?: string;
  }): Promise<string> {
    const modelId =
      this.configService.get<string>('HIGGSFIELD_MODEL_ID') ??
      'dop-turbo';

    const result = await this.runGeneration(modelId, params);

    return result.resultUrl;
  }

  async generateAndSaveVideo(params: {
    prompt: string;
    businessId: string;
    sourceUrl?: string;
  }): Promise<string> {
    const videoUrl = await this.generateVideo({
      prompt: params.prompt,
      sourceUrl: params.sourceUrl,
    });

    return await this.downloadAndSaveVideo(videoUrl, params.businessId);
  }

  private async runGeneration(
    model: string,
    params: { prompt: string; sourceUrl?: string },
  ): Promise<HiggsfieldsResult> {
    const videoParams: Record<string, unknown> = {
      model,
      prompt: params.prompt,
    };

    if (params.sourceUrl) {
      videoParams.input_images = [
        { type: 'image_url', image_url: params.sourceUrl },
      ];
    }

    try {
      const response = await this.client.subscribe('/v1/image2video/dop', {
        input: { params: videoParams },
        withPolling: true,
      });

      if (response.status === 'nsfw') {
        throw new InternalServerErrorException(
          'Video generation failed: content rejected by moderation',
        );
      }

      if (response.status !== 'completed') {
        this.logger.error(
          `Unexpected SDK response: status=${response.status}`,
        );
        throw new InternalServerErrorException(
          `Video generation failed: status=${response.status}`,
        );
      }

      const resultUrl = response.video?.url;
      if (!resultUrl) {
        throw new InternalServerErrorException(
          'Video generation failed: no result URL',
        );
      }

      return {
        id: response.request_id,
        status: 'completed',
        resultUrl,
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Higgsfield SDK error: ${message}`);
      throw new InternalServerErrorException(
        `Video generation failed: ${message}`,
      );
    }
  }

  async downloadAndSaveVideo(
    videoUrl: string,
    businessId: string,
  ): Promise<string> {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new InternalServerErrorException(`Failed to download video: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const key = `ai-videos/${businessId}/${randomUUID()}.mp4`;
    await this.s3Service.upload(key, buffer, 'video/mp4');
    return key;
  }
}
