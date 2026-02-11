import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { AudienceService } from "./audience.service";
import { AudienceIdParamDto,  CreateAudienceDto, UpdateAudienceDto } from "./dto/audience.dto";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller("audience")
export class AudienceController {
  constructor(private readonly audienceService: AudienceService) {}

  @Get("/:id")
  @ResponseMessage('Audiences has been got!')
  async getAudiences(@Param() { id }: AudienceIdParamDto) {
    return await this.audienceService.getAudiences(id);
  }

  @Post()
  @ResponseMessage('Audience has been created!')
  createAudience(@Body() body: CreateAudienceDto) {
    return this.audienceService.createAudience(body);
  }

  @Patch("/:id")
  @ResponseMessage('Audience has been updated!')
  updateAudience(@Param() { id }: AudienceIdParamDto, @Body() body: UpdateAudienceDto) {
    return this.audienceService.updateAudience(id, body);
  }

  @Delete("/:id")
  @ResponseMessage('Audience has been deleted!')
  deleteAudience(@Param() { id }: AudienceIdParamDto) {
    return this.audienceService.deleteAudience(id);
  }
}
