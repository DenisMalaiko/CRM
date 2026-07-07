import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { ContentPlanService } from './contentPlan.service';
import {
  GenerateContentPlanDto,
  UpdateContentPlanDto,
} from './dto/contentPlan.dto';

@UseGuards(JwtAuthGuard)
@Controller('contentPlan')
export class ContentPlanController {
  constructor(private readonly contentPlanService: ContentPlanService) {}

  @Get('/posts/:id')
  @ResponseMessage('Content plan posts retrieved successfully')
  async getContentPlanPosts(@Param('id') id: string) {
    return this.contentPlanService.getContentPlanPosts(id);
  }

  @Get('/:businessId')
  @ResponseMessage('Content plans retrieved successfully')
  async getContentPlans(@Param('businessId') businessId: string) {
    return this.contentPlanService.getContentPlans(businessId);
  }

  @Post('/:businessId')
  @ResponseMessage('Content plan generated successfully')
  async generateContentPlan(
    @Param('businessId') businessId: string,
    @Body() dto: GenerateContentPlanDto,
  ) {
    return this.contentPlanService.generateContentPlan(businessId, dto);
  }

  @Patch('/:id')
  @ResponseMessage('Content plan updated successfully')
  async updateContentPlan(
    @Param('id') id: string,
    @Body() dto: UpdateContentPlanDto,
  ) {
    return this.contentPlanService.updateContentPlan(id, dto);
  }

  @Delete('/:id')
  @ResponseMessage('Content plan deleted successfully')
  async deleteContentPlan(@Param('id') id: string) {
    return this.contentPlanService.deleteContentPlan(id);
  }
}
