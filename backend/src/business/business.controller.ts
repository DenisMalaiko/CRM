import {Body, Controller, Get, Post, Res} from '@nestjs/common';
import {BusinessService} from "./business.service";
import {BusinessDto} from "./dto/business.dto";

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post("/createBusiness")
  async createBusiness(@Body() body: BusinessDto, @Res() res: any) {
    const response = await this.businessService.createBusiness(body);
    return res.json(response);
  }

  @Get("/businessList")
  async getBusinessList() {
    return await this.businessService.getBusinessList();
  }
}