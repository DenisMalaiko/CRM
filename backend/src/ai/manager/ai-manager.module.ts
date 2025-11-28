import { Module } from '@nestjs/common';
import { AuthModule } from "../../auth/auth.module";
import { AiManagerController } from "./ai-manager.controller";

@Module({
  imports: [AuthModule],
  controllers: [AiManagerController],
  providers: [],
})
export class AiManagerModule {}