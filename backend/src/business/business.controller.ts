import { Body, Controller, Get, Post, Res, Param, UseGuards } from '@nestjs/common';
import {BusinessService} from "./business.service";
import {BusinessDto} from "./dto/business.dto";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/")
  async getBusinessList() {
    return await this.businessService.getBusinessList();
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getBusinessById(@Param() params: any) {
    return await this.businessService.getBusiness(params.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createBusiness(@Body() body: BusinessDto, @Res() res: any) {
    const response = await this.businessService.createBusiness(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/users/:id")
  async getUsersByBusinessId(@Param() params: any) {
    return await this.businessService.getUsersByBusinessId(params.id)
  }
}