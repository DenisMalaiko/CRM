import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { ContentPlanService } from './contentPlan.service';
import {
  GenerateContentPlanDto,
  UpdateContentPlanDto,
  UpdateContentPlanPostDto,
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

  @Patch('/:id/posts/:day')
  @ResponseMessage('Content plan post updated successfully')
  async updateContentPlanPost(
    @Request() req,
    @Param('id') id: string,
    @Param('day', ParseIntPipe) day: number,
    @Body() dto: UpdateContentPlanPostDto,
  ) {
    return this.contentPlanService.updateContentPlanPost(
      id,
      day,
      dto,
      req.user.agencyId,
    );
  }

  @Delete('/:id/posts/:day')
  @ResponseMessage('Content plan post deleted successfully')
  async deleteContentPlanPost(
    @Request() req,
    @Param('id') id: string,
    @Param('day', ParseIntPipe) day: number,
  ) {
    return this.contentPlanService.deleteContentPlanPost(
      id,
      day,
      req.user.agencyId,
    );
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
