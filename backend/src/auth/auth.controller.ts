import {Controller, Post, Req, Body, Headers, Res} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { UserDto } from "./dto/user.dto";
import { CredentialsDto } from "./dto/credentials.dto";
import { SignUpDto } from "./dto/signUp.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signUp")
  async signUp(@Body() body: SignUpDto, @Req() req: ExpressRequest) {
    return await this.authService.signUp(body);
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
}
