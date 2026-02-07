import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ApiResponseInterceptor } from "./common/interceptors/api-response.interceptor";

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AgencyModule } from './agency/agency.module';
import { BusinessModule } from './business/business.module';
import { ProductsModule } from './products/products.module';
import { ProfilesModule } from "./profiles/profiles.module";
import { AudienceModule } from "./audience/audience.module";
import { PlatformModule } from "./plaform/platform.module";
import { IngestionModule } from "./ingestion/ingestion.module";
import { AiModule } from "./ai/ai.module";
import { AIArtifactModule } from "./aiArtifact/aiArtifact.module";
import { PromptModule } from './prompt/prompt.module';
import { StorageModule } from "./shared/storage/storage.module";

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
    PrismaModule,
    AdminModule,
    AuthModule,
    AgencyModule,
    BusinessModule,
    ProductsModule,
    ProfilesModule,
    AudienceModule,
    PlatformModule,
    IngestionModule,
    AIArtifactModule,
    AiModule,
    PromptModule,
    StorageModule
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
