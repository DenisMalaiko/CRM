import {Post, Body, Controller, Req, Res} from '@nestjs/common';
import type {Request as ExpressRequest} from "express";

import {AdminService} from './admin.service';
import {AdminDto} from "./dto/admin.dto";
import {CredentialsDto} from "../auth/dto/credentials.dto";

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("/signUp")
  async signUp(@Body() body: AdminDto, @Req() req: ExpressRequest) {
    return await this.adminService.signUp(body);
  }

  @Post("/signIn")
  async signIn(@Body() body: CredentialsDto, @Res() res: any) {
    const { data, ...response } = await this.adminService.signIn(body);

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
      message: "Admin has been signed out!",
      data: null,
      error: null,
    });
  }
}