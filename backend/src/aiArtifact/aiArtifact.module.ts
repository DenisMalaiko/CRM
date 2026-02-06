import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AiArtifactController } from "./aiArtifact.controller";
import { AiArtifactService } from "./aiArtifact.service";
import { StorageModule } from "../shared/storage/storage.module";

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [AiArtifactController],
  providers: [AiArtifactService],
})
export class AIArtifactModule {}
