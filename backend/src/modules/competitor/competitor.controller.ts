import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompetitorIdParamDto, CreateCompetitorDto, UpdateCompetitorDto, CompetitorPostParamsDto } from "./dto/competitor.dto";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { CompetitorService } from "./competitor.service";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('competitors')
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  @Get("/list/:id")
  @ResponseMessage('Competitors has been got!')
  async getCompetitors(@Param() { id }: CompetitorIdParamDto) {
    return await this.competitorService.getCompetitors(id);
  }

  @Get("/:id")
  @ResponseMessage('Competitors has been got!')
  async getCompetitor(@Param() { id }: CompetitorIdParamDto) {
    return await this.competitorService.getCompetitor(id);
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



  @Post("/posts/:id")
  @ResponseMessage('Posts have been got!')
  async fetchPosts(@Param() { id }: CompetitorIdParamDto, @Body() body: CompetitorPostParamsDto) {
    console.log("FETCH POSTS")
    return this.competitorService.fetchPosts(id, body);
  }

  @Get("/posts/:id")
  @ResponseMessage('Posts have been got!')
  async getPosts(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.getPosts(id);
  }



  @Post("/ads/:id")
  @ResponseMessage('Ads have been got!')
  async getAds(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.getAds(id);
  }
}