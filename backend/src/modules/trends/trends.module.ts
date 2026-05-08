import { Module } from '@nestjs/common';
import { TrendsController } from './trends.controller';
import { TrendsService } from './trends.service';
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TrendsController],
  providers: [TrendsService],
})
export class TrendsModule {}
