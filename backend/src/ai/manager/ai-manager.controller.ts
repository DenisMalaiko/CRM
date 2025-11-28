import {Controller, UseGuards, Post, Get, Body} from '@nestjs/common';
import {JwtAuthGuard} from "../../guards/jwt-auth.guard";

@Controller('ai')
export class AiManagerController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Post("/manager/sessions")
  async createSession(@Body() body: any) {
    console.log("CREATE SESSION ", body);
    return {
      data: "CREATE SESSION"
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/manager/sessions")
  async getSessions(@Body() body: any) {
    console.log("GET SESSIONS ", body);
    return {
      data: "GET SESSIONS"
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/manager/sessions/:id")
  async getSession(@Body() body: any) {
    console.log("GET SESSION ", body);
    return {
      data: "GET SESSION"
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("/manager/sessions/:id/messages")
  async sendMessage(@Body() body: any) {
    console.log("SEND MESSAGE ", body);

    return {
      data: `SEND MESSAGE FROM SERVER ${body.message}`
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("/manager/sessions/:id/messages")
  async getMessage(@Body() body: any) {
    console.log("GET MESSAGES ", body);
    return {
      data: "GET MESSAGES"
    }
  }
}