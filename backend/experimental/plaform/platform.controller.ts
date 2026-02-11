import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards} from "@nestjs/common";
import { JwtAuthGuard } from "../../src/core/guards/jwt-auth.guard";
import { PlatformDto } from "./dto/platform.dto";
import { PlatformService } from "./platform.service";

@Controller("platform")
export class PlatformController {
  constructor(
    private readonly platformService: PlatformService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getPlatforms(@Param() params: any, @Res() res: any) {
    const businessId = params.id;
    if(!businessId) return res.json([]);
    const response = await this.platformService.getPlatforms(businessId);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createPlatform(@Body() body: PlatformDto, @Res() res: any) {
    const response = await this.platformService.createPlatform(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updatePlatform(@Param("id") id: string, @Body() body: PlatformDto, @Res()res: any) {
    const response = await this.platformService.updatePlatform(id, body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deletePlatform(@Param("id") id: string, @Res() res: any) {
    const response = await this.platformService.deletePlatform(id);
    return res.json(response);
  }
}