import {Controller, UseGuards, Get, Param, Res} from '@nestjs/common';
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AiArtifactService } from "./aiArtifact.service";

@Controller('ai-artifact')
export class AiArtifactController {
  constructor(
    private readonly aiArtifactService: AiArtifactService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getAiArtifacts(@Param("id") id: string, @Res() res: any) {
    const businessId = id;
    if(!businessId) return res.json([]);
    const response = await this.aiArtifactService.getAiArtifacts(businessId);
    return res.json(response);
  }
}