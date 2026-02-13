import { Module } from '@nestjs/common';
import { CompetitorController } from "./competitor.controller";
import { CompetitorService } from './competitor.service';
import { AuthModule } from "../auth/auth.module";
import { FacebookModule } from "../facebook/facebook.module";

@Module({
  imports: [AuthModule, FacebookModule],
  controllers: [CompetitorController],
  providers: [CompetitorService],
})
export class CompetitorModule {}