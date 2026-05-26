import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { S3Module } from "../../core/s3/s3.module";
import { StorageModule } from "../../core/storage/storage.module";
import { AiArtifactController } from "./aiArtifact.controller";
import { AiArtifactService } from "./aiArtifact.service";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [AuthModule, AiModule, S3Module, StorageModule],
  controllers: [AiArtifactController],
  providers: [AiArtifactService],
})
export class AIArtifactModule {}
