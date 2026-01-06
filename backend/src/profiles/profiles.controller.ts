import { Controller, UseGuards, Get, Param, Res, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { ProfilesService } from "./profiles.service";
import { ProfileDto } from "./dto/profile.dto";

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getProfiles(@Param() params: any, @Res() res: any) {
    const businessId = params.id;
    if(!businessId) return res.json([]);
    const response = await this.profilesService.getProfiles(businessId);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createProfile(@Body() body: ProfileDto, @Res() res: any) {
    const response = await this.profilesService.createProfile(body);
    return res.json(response);
  }
}