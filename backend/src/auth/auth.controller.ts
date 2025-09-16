import { Controller, Post, Req, Body } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';

import { UserDto } from "./dto/user.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signUp")
  async signUp(@Body() body: UserDto, @Req() req: ExpressRequest) {
    console.log("START CONTROLLER")
    return await this.authService.signUp(body);
  }
}
