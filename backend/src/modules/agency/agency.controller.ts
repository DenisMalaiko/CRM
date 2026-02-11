import { Body, Controller, Get, Post, Res, Param, UseGuards } from '@nestjs/common';
import { AgencyService } from "./agency.service";
import { AgencyIdParamDto, CreateAgencyDto } from "./dto/agency.dto";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('agency')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Get("/")
  @ResponseMessage('Agencies has been got!')
  async getAgencyList() {
    return await this.agencyService.getAgencyList();
  }

  @Get("/:id")
  @ResponseMessage('Agencies has been got by id!')
  async getAgencyById(@Param() { id }: AgencyIdParamDto) {
    return await this.agencyService.getAgency(id)
  }

  @Post("/create")
  @ResponseMessage('Agency has been created!')
  async createAgency(@Body() body: CreateAgencyDto) {
    return await this.agencyService.createAgency(body);
  }

  @Get("/users/:id")
  @ResponseMessage('Users has been got by agency id!')
  async getUsersByAgencyId(@Param() { id }: AgencyIdParamDto) {
    return await this.agencyService.getUsersByAgencyId(id)
  }
}