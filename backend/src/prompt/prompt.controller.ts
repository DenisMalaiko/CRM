import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PromptIdParamDto, CreatePromptDto, UpdatePromptDto } from "./dto/prompt.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PromptService } from "./prompt.service";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Get("/:id")
  @ResponseMessage('Prompts has been got!')
  async getPrompts(@Param() { id }: PromptIdParamDto) {
    return await this.promptService.getPrompts(id);
  }

  @Post()
  @ResponseMessage('Prompt has been created!')
  createPrompt(@Body() body: CreatePromptDto) {
    return this.promptService.createPrompt(body);
  }

  @Patch("/:id")
  @ResponseMessage('Prompt has been updated!')
  updatePrompt(@Param() { id }: PromptIdParamDto, @Body() body: UpdatePromptDto) {
    return this.promptService.updatePrompt(id, body);
  }

  @Delete("/:id")
  @ResponseMessage('Prompt has been deleted!')
  deletePrompt(@Param() { id }: PromptIdParamDto) {
    return this.promptService.deletePrompt(id);
  }
}
