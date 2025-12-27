import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { BusinessService } from "./business.service";
import { BusinessDto, BusinessParamsDto } from "./dto/business.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/list/:id")
  async getBusinesses(@Param() params: BusinessParamsDto, @Res() res: any) {
    const agencyId = params.id;

    if(!agencyId) return res.json([]);

    const response = await this.businessService.getBusinesses(agencyId);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getBusinessById(@Param() params: BusinessParamsDto, @Res() res: any) {
    const id = params.id;

    if(!id) return res.json([]);

    const response = await this.businessService.getBusiness(id);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createBusiness(@Body() body: BusinessDto, @Res() res: any) {
    const response = await this.businessService.createBusiness(body);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateBusiness(@Param("id") id: string, @Body() body: BusinessDto, @Res() res: any) {
    const response = await this.businessService.updateBusiness(id, body);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteProduct(@Param("id") id: string, @Res() res: any) {
    const response = await this.businessService.deleteBusiness(id);

    return res.json(response);
  }
}