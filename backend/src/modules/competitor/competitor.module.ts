import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { FacebookModule } from "../facebook/facebook.module";
import { CompetitorController } from "./competitor.controller";
import { CompetitorService } from './competitor.service';

@Module({
  imports: [AuthModule, FacebookModule],
  controllers: [CompetitorController],
  providers: [CompetitorService],
  exports: [CompetitorService]
})
export class CompetitorModule {}