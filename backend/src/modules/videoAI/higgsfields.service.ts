import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../../core/s3/s3.service';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface HiggsfieldsResult {
  id: string;
  status: string;
  resultUrl: string;
}

@Injectable()
export class HiggsfieldsService {
  private readonly logger = new Logger(HiggsfieldsService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async generateVideo(params: {
    prompt: string;
    sourceUrl?: string;
  }): Promise<string> {
    const modelId =
      this.configService.get<string>('HIGGSFIELD_MODEL_ID') ??
      'cinematic_studio_video_v2';

    const result = await this.runCli(modelId, params);

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

  private async runCli(
    model: string,
    params: { prompt: string; sourceUrl?: string },
  ): Promise<HiggsfieldsResult> {
    const args = [
      'generate',
      'create',
      model,
      '--prompt',
      params.prompt,
      '--aspect_ratio',
      '9:16',
      '--wait',
      '--json',
    ];

    if (params.sourceUrl) {
      args.push('--start-image', params.sourceUrl);
    }

    try {
      const { stdout } = await execFileAsync('higgsfield', args, {
        timeout: 10 * 60 * 1000,
      });

      const jobs = JSON.parse(stdout);
      const job = jobs[0];

      if (!job || job.status !== 'completed' || !job.result_url) {
        this.logger.error(`Unexpected CLI response: ${stdout}`);
        throw new InternalServerErrorException(
          `Video generation failed: status=${job?.status}`,
        );
      }

      return {
        id: job.id,
        status: job.status,
        resultUrl: job.result_url,
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error(`Higgsfield CLI error: ${err.message}`);
      throw new InternalServerErrorException(
        `Video generation failed: ${err.message}`,
      );
    }
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
