import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AiArtifactController } from "./aiArtifact.controller";
import { AiArtifactService } from "./aiArtifact.service";

@Module({
  imports: [AuthModule],
  controllers: [AiArtifactController],
  providers: [AiArtifactService],
})
export class AIArtifactModule {}
