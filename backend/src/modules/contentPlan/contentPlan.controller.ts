import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { ContentPlanService } from './contentPlan.service';

@UseGuards(JwtAuthGuard)
@Controller('contentPlan')
export class ContentPlanController {
  constructor(private readonly contentPlanService: ContentPlanService) {}

  @Get('/:id')
  @ResponseMessage('Content plans retrieved successfully')
  async getContentPlans(@Param('id') id: string) {
    return await this.contentPlanService.getContentPlans(id);
  }
}
