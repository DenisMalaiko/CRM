import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards} from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AudienceService } from "./audience.service";
import { AudienceDto } from "./dto/audience.dto";

@Controller("audience")
export class AudienceController {
  constructor(
    private readonly audienceService: AudienceService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getAudiences(@Param() params: any, @Res() res: any) {
    const businessId = params.id;
    if(!businessId) return res.json([]);
    const response = await this.audienceService.getAudiences(businessId);
    console.log("AUDIENCES ", response)
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createAudience(@Body() body: AudienceDto, @Res() res: any) {
    const response = await this.audienceService.createAudience(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateAudience(@Param("id") id: string, @Body() body: AudienceDto, @Res()res: any) {
    const response = await this.audienceService.updateAudience(id, body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteAudience(@Param("id") id: string, @Res() res: any) {
    const response = await this.audienceService.deleteAudience(id);
    return res.json(response);
  }
}
