import { Module } from '@nestjs/common';
import { AuthModule } from "../../auth/auth.module";
import { AiManagerController } from "./ai-manager.controller";
import { AiManagerService } from "./ai-manager.service";

@Module({
  imports: [AuthModule],
  controllers: [AiManagerController],
  providers: [AiManagerService],
})
export class AiManagerModule {}