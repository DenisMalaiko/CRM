import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { TrendsService } from './trends.service';
import { TrendIdParamDto } from './dto/trend.dto';

@ApiTags('Trends')
@UseGuards(JwtAuthGuard)
@Controller('trends')
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  @Get('/tiktok/:businessId')
  @ResponseMessage('TikTok videos got!')
  getTikTokVideosByBusinessId(@Param() { businessId }: TrendIdParamDto) {
    return this.trendsService.getTikTokVideosByBusinessId(businessId);
  }

  @Post('/tiktok/:businessId')
  @ResponseMessage('TikTok videos fetched!')
  fetchTikTokVideosByBusinessId(@Param() { businessId }: TrendIdParamDto) {
    return this.trendsService.fetchTikTokVideosByBusinessId(businessId);
  }
}
