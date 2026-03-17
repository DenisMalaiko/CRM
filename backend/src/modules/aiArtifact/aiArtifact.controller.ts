import {Controller, UseGuards, Get, Param, Delete, Body, Patch, Query, Post} from '@nestjs/common';
import { AiArtifactIdParamDto, UpdateAiArtifactDto, CreateAiArtifactDto } from "./dto/aiartifact.dto";
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
  createAiArtifact(@Param() { id }: AiArtifactIdParamDto, @Body() body: CreateAiArtifactDto) {
    return this.aiArtifactService.createArtifact(id, body);
  }
}