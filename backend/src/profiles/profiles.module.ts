import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from "./profiles.service";
import { AuthModule } from "../auth/auth.module";
import { IngestionModule } from "../ingestion/ingestion.module";

@Module({
  imports: [AuthModule, IngestionModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}