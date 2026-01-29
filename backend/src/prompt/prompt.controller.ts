import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../guards/jwt-auth.guard";
import {PromptService} from "./prompt.service";
import {PromptDto} from "./dto/prompt.dto";

@Controller('prompts')
export class PromptController {
  constructor(
    private readonly promptService: PromptService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getPrompts(@Param("id") id: string, @Res() res: any) {
    const businessId = id;
    if(!businessId) return res.json([]);
    const response = await this.promptService.getPrompts(businessId);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createPrompt(@Body() body: any, @Res() res: any) {
    const response = await this.promptService.createPrompt(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updatePrompt(@Param("id") id: string, @Body() body: PromptDto, @Res() res: any) {
    const response = await this.promptService.updatePrompt(id, body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deletePrompt(@Param("id") id: string, @Res() res: any) {
    const response = await this.promptService.deletePrompt(id);
    return res.json(response);
  }
}
