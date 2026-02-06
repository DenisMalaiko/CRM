import { Controller, Post, Get, Req, Body, Headers, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest, Response} from 'express';
import * as process from "node:process";

import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from "./dto/user.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { ResponseMessage } from "../common/decorators/response-message.decorator";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly isProd = process.env.NODE_ENV === 'production';

  @Post("/signUp")
  @ResponseMessage('User has been signed up!')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post("/signIn")
  @ResponseMessage('User has been signed in!')
  async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
    const response = await this.authService.signIn(body);

    res.cookie('refresh_token', response?.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return response;
  }

  @Post("/signOut")
  @ResponseMessage('User has been signed out!')
  async signOut(@Res() res: any) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
    });

    return res.json({
      statusCode: 200,
      message: "User has been signed out!",
      data: null,
      error: null,
    });
  }

  @Post("/refresh")
  async refresh(@Req() request: ExpressRequest, @Res() res: any) {
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const response = await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', response?.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({
      ...response
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("/me")
  async me(@Req() request: any,  @Res() res: any, @Headers('authorization') authorization: string) {
    const user = request.user;
    const response = await this.authService.me(user);

    res.cookie('refresh_token', response?.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({
      ...response
    });
  }
}
