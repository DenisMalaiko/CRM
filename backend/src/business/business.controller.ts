import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateBusinessDto, UpdateBusinessDto, BusinessIdParamDto } from "./dto/business.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { BusinessService } from "./business.service";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

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

  @Delete("/:id")
  @ResponseMessage('Business has been deleted!')
  deleteBusiness(@Param() { id }: BusinessIdParamDto) {
    return this.businessService.deleteBusiness(id);
  }
}