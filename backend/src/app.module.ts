import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { ApiResponseInterceptor } from "./core/interceptors/api-response.interceptor";
import { StorageModule } from "./core/storage/storage.module";
import { S3Module } from "./core/s3/s3.module";

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { AgencyModule } from './modules/agency/agency.module';
import { BusinessModule } from './modules/business/business.module';
import { ProductsModule } from './modules/products/products.module';
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { AudienceModule } from "./modules/audience/audience.module";
import { AiModule } from "./modules/ai/ai.module";
import { AIArtifactModule } from "./modules/aiArtifact/aiArtifact.module";
import { PromptModule } from './modules/prompt/prompt.module';
import { CompetitorModule } from "./modules/competitor/competitor.module";
import { ApifyModule } from "./modules/apify/apify.module";
import { FacebookModule } from "./modules/facebook/facebook.module";
import { GalleryModule } from "./modules/gallery/gallery.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StorageModule,
    S3Module,

    AdminModule,
    AuthModule,
    AgencyModule,
    BusinessModule,
    ProductsModule,
    ProfilesModule,
    AudienceModule,
    AIArtifactModule,
    AiModule,
    PromptModule,
    CompetitorModule,
    ApifyModule,
    FacebookModule,
    GalleryModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService
  ],
})

export class AppModule {}
