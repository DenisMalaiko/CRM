import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { TrendsService } from './trends.service';
import {
  CreateTrendDto,
  ProfileIdParamDto,
  TrendFilterDto,
  TrendIdParamDto,
  UpdateTrendDto,
} from './dto/trend.dto';

@ApiTags('Trends')
@UseGuards(JwtAuthGuard)
@Controller('trends')
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}


  @Get('/:id')
  @ResponseMessage('Trend fetched!')
  getTrendsByBusinessId(@Param() { id }: TrendIdParamDto) {
    console.log("CONTROLLER GET TRENDS BY BUSINESS ID ", id);
    return this.trendsService.getTrendsByBusinessId(id);
  }






  @Post('/match/:profileId')
  @ResponseMessage('Profile trends matched!')
  matchProfileTrends(@Param() { profileId }: ProfileIdParamDto) {
    return this.trendsService.matchProfileTrends(profileId);
  }

  @Get('/profile/:profileId')
  @ResponseMessage('Profile trends fetched!')
  getProfileTrends(@Param() { profileId }: ProfileIdParamDto) {
    return this.trendsService.getProfileTrends(profileId);
  }

  @Post()
  @ResponseMessage('Trend has been created!')
  createTrend(@Body() body: CreateTrendDto) {
    return this.trendsService.createTrend({
      ...body,
      publishedAt: new Date(body.publishedAt),
    });
  }

  @Get()
  @ResponseMessage('Trends fetched!')
  getTrends(@Query() query: TrendFilterDto) {
    return this.trendsService.getTrends(query);
  }

  @Get('/list/:id')
  @ResponseMessage('Trend fetched!')
  getTrendById(@Param() { id }: TrendIdParamDto) {
    return this.trendsService.getTrend(id);
  }

  @Patch('/:id')
  @ResponseMessage('Trend has been updated!')
  updateTrend(@Param() { id }: TrendIdParamDto, @Body() body: UpdateTrendDto) {
    const data: Record<string, unknown> = { ...body };
    if (body.publishedAt) {
      data.publishedAt = new Date(body.publishedAt);
    }
    return this.trendsService.updateTrend(id, data);
  }

  @Delete('/:id')
  @ResponseMessage('Trend has been deleted!')
  deleteTrend(@Param() { id }: TrendIdParamDto) {
    return this.trendsService.deleteTrend(id);
  }
}
