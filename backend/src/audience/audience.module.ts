import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { AudienceController } from "./audience.controller";
import { AudienceService } from "./audience.service";

@Module({
  imports: [AuthModule],
  controllers: [AudienceController],
  providers: [AudienceService],
})
export class AudienceModule {}