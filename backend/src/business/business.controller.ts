import { Body, Controller, Get, Post, Res, Param } from '@nestjs/common';
import {BusinessService} from "./business.service";
import {BusinessDto} from "./dto/business.dto";

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get("/")
  async getBusinessList() {
    return await this.businessService.getBusinessList();
  }

  @Get("/:id")
  async getBusinessById(@Param() params: any) {
    return await this.businessService.getBusiness(params.id)
  }

  @Post("/create")
  async createBusiness(@Body() body: BusinessDto, @Res() res: any) {
    const response = await this.businessService.createBusiness(body);
    return res.json(response);
  }

  @Get("/users/:id")
  async getUsersByBusinessId(@Param() params: any) {
    return await this.businessService.getUsersByBusinessId(params.id)
  }
}