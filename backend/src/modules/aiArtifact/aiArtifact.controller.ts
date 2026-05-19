import {Controller, UseGuards, Get, Param, Delete, Body, Patch, Query, Post} from '@nestjs/common';
import {
  AiArtifactIdParamDto,
  AiArtifactBusinessParamDto,
  UpdateAiArtifactDto,
  CreateArtifactWithMediaDto,
  GenerateImageDto,
  GenerateVideoDto,
} from "./dto/aiartifact.dto";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { AiArtifactService } from "./aiArtifact.service";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";
import { AIArtifactType } from "@prisma/client";

@UseGuards(JwtAuthGuard)
@Controller('ai-artifact')
export class AiArtifactController {
  constructor(private readonly aiArtifactService: AiArtifactService) {}

  @Get("/:id")
  @ResponseMessage('Artifacts has been got!')
  async getAiArtifacts(@Param() { id }: AiArtifactIdParamDto, @Query("type") type?: AIArtifactType) {
    return await this.aiArtifactService.getAiArtifacts(id, type);
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

  @Post("/:id")
  @ResponseMessage('Creative has been created!')
  createAiArtifact(@Param() { id }: AiArtifactIdParamDto, @Body() body: CreateArtifactWithMediaDto) {
    return this.aiArtifactService.createArtifact(id, body);
  }

  @Post('/:id/regenerate')
  @ResponseMessage('Creative has been regenerated!')
  async regenerateAiArtifact(
    @Param() { id }: AiArtifactIdParamDto,
    @Body() body: { prompt: string },
  ) {
    return this.aiArtifactService.regenerateAiArtifact(id, body.prompt);
  }

  @Post(':id/revert-original')
  @ResponseMessage('Creative has been revert to original!')
  async revertOriginal(@Param() { id }: AiArtifactIdParamDto) {
    return this.aiArtifactService.revertAiArtifactOriginal(id)
  }

  @Post(':id/revert-previous')
  @ResponseMessage('Creative has been revert to previous!')
  async revertPrevious(@Param() { id }: AiArtifactIdParamDto) {
    return this.aiArtifactService.revertAiArtifactPrevious(id)
  }

  @Get('/:businessId/artifact/:artifactId')
  @ResponseMessage('Artifact retrieved!')
  async getArtifact(@Param() { businessId, artifactId }: AiArtifactBusinessParamDto) {
    return this.aiArtifactService.getAiArtifact(artifactId, businessId);
  }
}
