import {Controller, UseGuards, Get, Param, Res, Post, Body, Patch, Delete} from '@nestjs/common';
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
  async getProfiles(@Param("id") id: string, @Res() res: any) {
    const businessId = id;
    if(!businessId) return res.json([]);
    const response = await this.profilesService.getProfiles(businessId);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createProfile(@Body() body: any, @Res() res: any) {
    const response = await this.profilesService.createProfile(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateProfile(@Param("id") id: string, @Body() body: ProfileDto, @Res()res: any) {
    const response = await this.profilesService.updateProfile(id, body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteProfile(@Param("id") id: string, @Res() res: any) {
    const response = await this.profilesService.deleteProfile(id);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/generatePosts/:id")
  async generatePosts(@Param("id") id: string, @Res() res: any) {
    const response = await this.profilesService.generateProfilePosts(id);
    return res.json(response);
  }
}