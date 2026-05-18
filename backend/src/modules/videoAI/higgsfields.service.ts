import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../core/s3/s3.service';
import { randomUUID } from 'crypto';

export interface HiggsfieldsJobStatus {
  status: 'queued' | 'in_progress' | 'nsfw' | 'failed' | 'completed';
  videoUrl?: string;
}

@Injectable()
export class HiggsfieldsService {
  private readonly baseUrl = 'https://platform.higgsfield.ai';

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async createVideoJob(params: {
    prompt: string;
    sourceUrl?: string;
  }): Promise<string> {
    const modelId = this.configService.get<string>('HIGGSFIELD_MODEL_ID') ?? 'higgsfield-ai/soul/standard';
    const authHeader = `Key ${this.configService.get<string>('HIGGSFIELD_API_KEY')}:${this.configService.get<string>('HIGGSFIELD_API_KEY_SECRET')}`;

    const body: Record<string, any> = {
      prompt: params.prompt,
      aspect_ratio: '9:16',
      resolution: '720p',
    };
    if (params.sourceUrl) {
      body.source_url = params.sourceUrl;
    }

    const response = await fetch(`${this.baseUrl}/${modelId}`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Higgsfield API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data.request_id;
  }

  async getJobStatus(requestId: string): Promise<HiggsfieldsJobStatus> {
    const authHeader = `Key ${this.configService.get<string>('HIGGSFIELD_API_KEY')}:${this.configService.get<string>('HIGGSFIELD_API_KEY_SECRET')}`;
    const response = await fetch(
      `${this.baseUrl}/requests/${requestId}/status`,
      { headers: { Authorization: authHeader } },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Higgsfield status error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      videoUrl: data.video?.url,
    };
  }

  async downloadAndSaveVideo(
    videoUrl: string,
    businessId: string,
  ): Promise<string> {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const key = `ai-videos/${businessId}/${randomUUID()}.mp4`;
    await this.s3Service.upload(key, buffer, 'video/mp4');
    return key;
  }
}
