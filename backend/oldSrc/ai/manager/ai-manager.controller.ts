import {Controller, UseGuards, Post, Req, Get, Body, Param, Delete } from '@nestjs/common';
import {JwtAuthGuard} from "../../guards/jwt-auth.guard";
import { AiManagerService } from "./ai-manager.service";

@Controller('ai')
export class AiManagerController {
  constructor(private readonly ai: AiManagerService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post("/manager/sessions")
  async createSession(@Req() req) {
    const session = await this.ai.createSession(req.user);
    return { data: session }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/manager/sessions")
  async getSessions(@Req() req) {
    const sessions = await this.ai.getSessions(req.user.id);
    return { data: sessions }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/manager/sessions/:id")
  async getSession(@Param('id') id: string) {
    const session = await this.ai.getSession(id);
    return { data: session }
  }

  @UseGuards(JwtAuthGuard)
  @Post("/manager/sessions/:id/messages")
  async sendMessage(@Req() req, @Body() body: any) {
    const message = await this.ai.sendMessage(req.user, body.data);
    return { data: message }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/manager/sessions/:id/messages")
  async getMessage(@Param('id') id: string) {
    const messages = await this.ai.getMessages(id);
    return { data: messages }
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/manager/sessions/:id")
  async deleteSession(@Param('id') id: string) {
    const session = await this.ai.deleteSession(id);
    return { data: session }
  }
}