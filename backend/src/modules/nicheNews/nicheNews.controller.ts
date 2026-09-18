import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { NicheNewsService } from './nicheNews.service';
import { BusinessIdParamDto } from './dto/nicheNews.dto';

@UseGuards(JwtAuthGuard)
@Controller('niche-news')
export class NicheNewsController {
  constructor(private readonly nicheNewsService: NicheNewsService) {}

  @Get('/business/:businessId')
  @ResponseMessage('Niche news retrieved!')
  getByBusinessId(@Param() { businessId }: BusinessIdParamDto) {
    return this.nicheNewsService.getByBusinessId(businessId);
  }

  @Post('/fetch/:businessId')
  @ResponseMessage('Niche news fetched!')
  fetchByBusinessId(@Param() { businessId }: BusinessIdParamDto) {
    return this.nicheNewsService.fetchByBusinessId(businessId);
  }
}
