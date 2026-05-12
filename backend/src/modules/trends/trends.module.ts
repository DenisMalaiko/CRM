import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { TiktokModule } from '../tiktok/tiktok.module';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';

@Module({
  imports: [AuthModule, TiktokModule],
  controllers: [TrendsController],
  providers: [TrendsService],
})
export class TrendsModule {}
