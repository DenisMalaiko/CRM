import { Body, Controller, Get, Post, Res, Param, UseGuards } from '@nestjs/common';
import {AgencyService} from "./agency.service";
import { AgencyCreateDto } from "./dto/agency.dto";
import {JwtAuthGuard} from "../guards/jwt-auth.guard";

@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/")
  async getAgencyList() {
    return await this.agencyService.getAgencyList();
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getAgencyById(@Param() params: any) {
    return await this.agencyService.getAgency(params.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createAgency(@Body() body: AgencyCreateDto, @Res() res: any) {
    const response = await this.agencyService.createAgency(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/users/:id")
  async getUsersByAgencyId(@Param() params: any) {
    return await this.agencyService.getUsersByAgencyId(params.id)
  }
}