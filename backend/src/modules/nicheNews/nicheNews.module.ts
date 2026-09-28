import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { NicheNewsController } from './nicheNews.controller';
import { NicheNewsService } from './nicheNews.service';
import { NicheNewsCronService } from './nicheNews-cron.service';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [NicheNewsController],
  providers: [NicheNewsService, NicheNewsCronService],
  exports: [NicheNewsService],
})
export class NicheNewsModule {}
