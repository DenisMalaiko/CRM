import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { AiModule } from "../ai/ai.module";
import { IdeaAIController } from "./ideaAI.controller";
import { IdeaAIService } from "./ideaAI.service";

@Module({
  imports: [AuthModule, AiModule],
  controllers: [IdeaAIController],
  providers: [IdeaAIService],
})
export class IdeaAIModule {}