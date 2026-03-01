import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { CompetitorModule } from "../competitor/competitor.module";
import { FacebookModule } from "../facebook/facebook.module";
import { IdeaController } from "./idea.controller";
import { IdeaService } from "./idea.service";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [ AuthModule, CompetitorModule, FacebookModule, AiModule ],
  controllers: [ IdeaController ],
  providers: [ IdeaService ],
})
export class IdeaModule {}