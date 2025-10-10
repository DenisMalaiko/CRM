import {Post, Body, Controller, Req} from '@nestjs/common';
import type {Request as ExpressRequest} from "express";

import {AdminService} from './admin.service';
import {AdminDto} from "./dto/admin.dto";

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("/signUp")
  async signUp(@Body() body: AdminDto, @Req() req: ExpressRequest) {
    return await this.adminService.signUp(body);
  }
}