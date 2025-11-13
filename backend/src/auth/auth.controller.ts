import {Controller, Post, Req, Body, Headers, Res, UnauthorizedException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { CredentialsDto } from "./dto/credentials.dto";
import { SignUpDto } from "./dto/signUp.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signUp")
  async signUp(@Body() body: SignUpDto, @Req() req: ExpressRequest) {
    const response = await this.authService.signUp(body);

    return response;
  }

  @Post("/signIn")
  async signIn(@Body() body: CredentialsDto, @Res() res: any) {
    const { data, ...response } = await this.authService.signIn(body);

    /*res.cookie('refresh_token', data?.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });*/

    res.cookie('refresh_token', data?.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
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

  @Post("/signOut")
  async signOut(@Res() res: any) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.json({
      ...response,
      data: {
        accessToken: data?.accessToken,
      },
    });
  }
}
