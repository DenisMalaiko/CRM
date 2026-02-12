import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompetitorIdParamDto, CreateCompetitorDto, UpdateCompetitorDto} from "./dto/competitor.dto";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { CompetitorService } from "./competitor.service";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('competitors')
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  @Get("/:id")
  @ResponseMessage('Competitors has been got!')
  async getCompetitors(@Param() { id }: CompetitorIdParamDto) {
    return await this.competitorService.getCompetitors(id);
  }

  @Post()
  @ResponseMessage('Competitor has been created!')
  createCompetitor(@Body() body: CreateCompetitorDto) {
    return this.competitorService.createCompetitor(body);
  }

  @Patch("/:id")
  @ResponseMessage('Competitor has been updated!')
  updateCompetitor(@Param() { id }: CompetitorIdParamDto, @Body() body: UpdateCompetitorDto) {
    return this.competitorService.updateCompetitor(id, body);
  }

  @Delete("/:id")
  @ResponseMessage('Competitor has been deleted!')
  deleteCompetitor(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.deleteCompetitor(id);
  }

  @Post("/generateReport/:id")
  @ResponseMessage('Report has been successfully generated!')
  async generateReport(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.generateReport(id);
  }
}