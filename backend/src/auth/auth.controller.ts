import { Controller, Post, Get, Req, Body, Headers, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest, Response} from 'express';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from "./dto/user.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import * as process from "node:process";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly isProd = process.env.NODE_ENV === 'production';

  @Post("/signUp")
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @Post("/signIn")
  async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
    const { data, ...response } = await this.authService.signIn(body);

    res.cookie('refresh_token', data?.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return {
      ...response,
      data: {
        user: data?.user,
        accessToken: data?.accessToken,
      },
    };
  }

  @Post("/signOut")
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

    const { data, ...response } = await this.authService.refreshToken(refreshToken);

    res.cookie('refreshToken', data?.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({
      ...response,
      data: {
        accessToken: data?.accessToken,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("/me")
  async me(@Req() request: any,  @Res() res: any, @Headers('authorization') authorization: string) {
    const user = request.user;
    const { data, ...response } = await this.authService.me(user);

    res.cookie('refresh_token', data?.refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({
      ...response,
      data: {
        user: data?.user,
        accessToken: data?.accessToken,
      },
    });
  }
}
