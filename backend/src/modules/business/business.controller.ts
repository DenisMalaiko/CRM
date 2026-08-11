import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateBusinessDto, UpdateBusinessDto, BusinessIdParamDto, ReportDto } from "./dto/business.dto";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { BusinessService } from "./business.service";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get("/list/:id")
  async getBusinesses(@Param() { id }: BusinessIdParamDto) {
    return await this.businessService.getBusinesses(id);
  }

  @Get("/:id")
  getBusinessById(@Param() { id }: BusinessIdParamDto) {
    return this.businessService.getBusiness(id);
  }

  @Post()
  @ResponseMessage('Business has been created!')
  createBusiness(@Body() body: CreateBusinessDto) {
    return this.businessService.createBusiness(body);
  }

  @Patch("/:id")
  @ResponseMessage('Business has been updated!')
  updateBusiness(@Param() { id }: BusinessIdParamDto, @Body() body: UpdateBusinessDto) {
    return this.businessService.updateBusiness(id, body);
  }

  @Get("/:id/facebook-report")
  getFacebookReport(@Param() { id }: BusinessIdParamDto) {
    return this.businessService.getFacebookReport(id);
  }

  @Post("/:id/facebook-report")
  @ResponseMessage('Facebook report updated!')
  upsertFacebookReport(@Param() { id }: BusinessIdParamDto, @Body() body: ReportDto) {
    return this.businessService.upsertFacebookReport(id, body);
  }

  @Get("/:id/instagram-report")
  getInstagramReport(@Param() { id }: BusinessIdParamDto) {
    return this.businessService.getInstagramReport(id);
  }

  @Post("/:id/instagram-report")
  @ResponseMessage('Instagram report updated!')
  upsertInstagramReport(@Param() { id }: BusinessIdParamDto, @Body() body: ReportDto) {
    return this.businessService.upsertInstagramReport(id, body);
  }

  @Post("/:id/instagram-report/fetch")
  @ResponseMessage('Instagram report fetched!')
  fetchInstagramReport(@Param() { id }: BusinessIdParamDto) {
    return this.businessService.fetchInstagramReport(id);
  }

  @Delete("/:id")
  @ResponseMessage('Business has been deleted!')
  deleteBusiness(@Param() { id }: BusinessIdParamDto) {
    return this.businessService.deleteBusiness(id);
  }
}