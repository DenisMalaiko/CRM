import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CompetitorIdParamDto,
  CreateCompetitorDto,
  UpdateCompetitorDto,
  CompetitorPostParamsDto,
  CompetitorAdsParamsDto,
} from './dto/competitor.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CompetitorService } from './competitor.service';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';

@UseGuards(JwtAuthGuard)
@Controller('competitors')
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  @Get('/list/:id')
  @ResponseMessage('Competitors has been got!')
  async getCompetitors(@Param() { id }: CompetitorIdParamDto) {
    return await this.competitorService.getCompetitors(id);
  }

  @Get('/:id')
  @ResponseMessage('Competitors has been got!')
  async getCompetitor(@Param() { id }: CompetitorIdParamDto) {
    return await this.competitorService.getCompetitor(id);
  }

  @Post()
  @ResponseMessage('Competitor has been created!')
  createCompetitor(@Body() body: CreateCompetitorDto) {
    return this.competitorService.createCompetitor(body);
  }

  @Patch('/:id')
  @ResponseMessage('Competitor has been updated!')
  updateCompetitor(
    @Param() { id }: CompetitorIdParamDto,
    @Body() body: UpdateCompetitorDto,
  ) {
    return this.competitorService.updateCompetitor(id, body);
  }

  @Delete('/:id')
  @ResponseMessage('Competitor has been deleted!')
  deleteCompetitor(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.deleteCompetitor(id);
  }

  // Instagram Report
  @Post('/instagramReport/:id')
  @ResponseMessage('Instagram report has been fetched!')
  async fetchCompetitorInstagramReport(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.fetchCompetitorInstagramReport(id);
  }

  // Facebook Report
  @Post('/facebookReport/:id')
  @ResponseMessage('Facebook report has been fetched!')
  async fetchCompetitorFacebookReport(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.fetchCompetitorFacebookReport(id);
  }

  // Posts
  @Post('/posts/:id')
  @ResponseMessage('Posts have been got!')
  async fetchPosts(
    @Param() { id }: CompetitorIdParamDto,
    @Body() body: CompetitorPostParamsDto,
  ) {
    return this.competitorService.fetchPosts(id, body);
  }

  @Get('/posts/:id')
  @ResponseMessage('Posts have been got!')
  async getPosts(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.getPosts(id);
  }

  // Instagram Posts
  @Post('/instagramPosts/:id')
  @ResponseMessage('Instagram posts have been got!')
  async fetchInstagramPosts(
    @Param() { id }: CompetitorIdParamDto,
    @Body() body: CompetitorPostParamsDto,
  ) {
    return this.competitorService.fetchInstagramPosts(id, body);
  }

  @Get('/instagramPosts/:id')
  @ResponseMessage('Instagram posts have been got!')
  async getInstagramPosts(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.getInstagramPosts(id);
  }

  // Instagram Reels
  @Post('/instagramReels/:id')
  @ResponseMessage('Instagram reels have been fetched!')
  async fetchInstagramReels(
    @Param() { id }: CompetitorIdParamDto,
    @Body() body: CompetitorPostParamsDto,
  ) {
    return this.competitorService.fetchInstagramReels(id, body);
  }

  @Get('/instagramReels/:id')
  @ResponseMessage('Instagram reels have been got!')
  async getInstagramReels(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.getInstagramReels(id);
  }

  // Ads
  @Post('/ads/:id')
  @ResponseMessage('Ads have been got!')
  async fetchAds(
    @Param() { id }: CompetitorIdParamDto,
    @Body() body: CompetitorAdsParamsDto,
  ) {
    return this.competitorService.fetchAds(id, body);
  }

  @Get('/ads/:id')
  @ResponseMessage('Ads have been got!')
  async getAds(@Param() { id }: CompetitorIdParamDto) {
    return this.competitorService.getAds(id);
  }
}
