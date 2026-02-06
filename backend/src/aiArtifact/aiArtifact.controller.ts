import {Controller, UseGuards, Get, Param, Res, Delete, Body, Patch} from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateAiArtifact(@Param("id") id: string, @Body() body: any, @Res() res: any) {
    const response = await this.aiArtifactService.updateAiArtifact(id, body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteAiArtifact(@Param("id") id: string, @Res() res: any) {
    const response = await this.aiArtifactService.deleteAiArtifact(id);
    return res.json(response);
  }
}