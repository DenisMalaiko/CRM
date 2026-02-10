import { Controller, UseGuards, Get, Param,  Delete, Body, Patch} from '@nestjs/common';
import { AiArtifactIdParamDto, UpdateAiArtifactDto } from "./dto/aiartifact.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AiArtifactService } from "./aiArtifact.service";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('ai-artifact')
export class AiArtifactController {
  constructor(private readonly aiArtifactService: AiArtifactService) {}

  @Get("/:id")
  @ResponseMessage('Artifacts has been got!')
  async getAiArtifacts(@Param() { id }: AiArtifactIdParamDto) {
    return await this.aiArtifactService.getAiArtifacts(id);
  }

  @Patch("/:id")
  @ResponseMessage('Creative has been updated!')
  updateAiArtifact(@Param() { id }: AiArtifactIdParamDto, @Body() body: UpdateAiArtifactDto) {
    return this.aiArtifactService.updateAiArtifact(id, body);
  }

  @Delete("/:id")
  @ResponseMessage('Creative has been deleted!')
  deleteAiArtifact(@Param() { id }: AiArtifactIdParamDto) {
    return this.aiArtifactService.deleteAiArtifact(id);
  }
}