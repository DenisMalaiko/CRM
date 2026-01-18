import { Module } from '@nestjs/common';
import { PLATFORM_ADAPTERS_TOKEN } from "./ingestion.tokens";
import { PLATFORM_ADAPTERS } from "./adapters";
import { IngestionService } from "./ingestion.service";
import { AiModule } from "../ai/ai.module";

@Module({
  providers: [
    ...PLATFORM_ADAPTERS,
    {
      provide: PLATFORM_ADAPTERS_TOKEN,
      useFactory: (...adapters) => adapters,
      inject: PLATFORM_ADAPTERS,
    },
    IngestionService,
  ],
  exports: [
    IngestionService,
  ],
  imports: [
    AiModule
  ]
})
export class IngestionModule {}