import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (config: ConfigService) =>
        new S3Client({
          region: config.getOrThrow<string>('AWS_REGION'),
          credentials: {
            accessKeyId: config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
          },
        }),
      inject: [ConfigService],
    },
    S3Service,
  ],
  exports: [S3Client, S3Service],
})
export class S3Module {}