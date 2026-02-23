import {Controller, UseGuards, Get, Param, Post, Body, Patch, Delete} from '@nestjs/common';
import { ProfileIdParamDto, CreateProfileDto, UpdateProfileDto } from "./dto/profile.dto";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { ProfilesService } from "./profiles.service";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get("/:id")
  @ResponseMessage('Profile has been got!')
  async getProfiles(@Param() { id }: ProfileIdParamDto) {
    return await this.profilesService.getProfiles(id);
  }

  @Post()
  @ResponseMessage('Profile has been created!')
  createProfile(@Body() body: CreateProfileDto) {
    return this.profilesService.createProfile(body);
  }

  @Patch("/:id")
  @ResponseMessage('Profile has been updated!')
  updateProfile(@Param() { id }: ProfileIdParamDto, @Body() body: UpdateProfileDto) {
    console.log("UPDATE PROFILE BODY: ", body)
    return this.profilesService.updateProfile(id, body);
  }

  @Delete("/:id")
  @ResponseMessage('Profile has been deleted!')
  deleteProfile(@Param() { id }: ProfileIdParamDto) {
    return this.profilesService.deleteProfile(id);
  }

  @Post("/generatePosts/:id")
  @ResponseMessage('Post has been successfully generated!')
  async generatePosts(@Param() { id }: ProfileIdParamDto) {
    return await this.profilesService.generateProfilePosts(id);
  }
}