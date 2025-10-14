import {Body, Controller, Post, Res} from '@nestjs/common';
import {BusinessService} from "./business.service";
import {BusinessDto} from "./dto/business.dto";

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post("/createBusiness")
  async createBusiness(@Body() body: BusinessDto, @Res() res: any) {
    console.log("CREATE BUSINESS ", body);
    const response = await this.businessService.createBusiness(body);

    return res.json(response);
  }
}