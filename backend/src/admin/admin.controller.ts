import { Post, Get, Body, Controller, Req, Res } from '@nestjs/common';
import type { Request as ExpressRequest, Response } from "express";
import { AdminService } from './admin.service';
import { TAdminCreate } from "./entities/admin.entity";
import { SignInDto } from "../auth/dto/user.dto";

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  private readonly isProd = process.env.NODE_ENV === 'production';

  @Post("/signUp")
  async signUp(@Body() body: TAdminCreate) {
    return await this.adminService.signUp(body);
  }

  @Post("/signIn")
  async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
    const { data, ...response } = await this.adminService.signIn(body);

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

  @Post("/signOut")
  async signOut(@Res() res: any) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
    });

    return res.json({
      statusCode: 200,
      message: "Admin has been signed out!",
      data: null,
      error: null,
    });
  }
}