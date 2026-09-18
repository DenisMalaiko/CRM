import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NicheNewsController } from './nicheNews.controller';
import { NicheNewsService } from './nicheNews.service';

@Module({
  imports: [AuthModule],
  controllers: [NicheNewsController],
  providers: [NicheNewsService],
  exports: [NicheNewsService],
})
export class NicheNewsModule {}
