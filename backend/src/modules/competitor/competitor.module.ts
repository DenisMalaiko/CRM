import { Module } from '@nestjs/common';
import { CompetitorController } from "./competitor.controller";
import { CompetitorService } from './competitor.service';
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [CompetitorController],
  providers: [CompetitorService],
})
export class CompetitorModule {}