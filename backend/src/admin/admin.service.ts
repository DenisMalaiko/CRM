import * as bcrypt from "bcrypt";
import * as process from "node:process";

import {Injectable, ConflictException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import { AdminDto } from "./dto/admin.dto";
import { Admin, AdminResponse } from "./entities/admin.entity";

//import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AdminService {
  private readonly SALT_ROUNDS: number = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  //private readonly JWT_REFRESH_SECRET: string = String(process.env.JWT_REFRESH_SECRET ?? 'refresh-secret');

  constructor(
    private readonly prisma: PrismaService,
    //private readonly jwt: JwtService
  ) {}


  async signUp(body: AdminDto): Promise<ApiResponse<AdminResponse>> {
    await this._checkExistingAdmin(body.email);

    const hashedPassword = await bcrypt.hash(body.password, this.SALT_ROUNDS);

    const admin: AdminResponse = await this.prisma.admin.create({
      data: { email: body.email, name: body.name, isAdmin: body.isAdmin, password: hashedPassword },
      select: { id: true,  name: true, email: true, isAdmin: true }
    });

    return {
      statusCode: 200,
      message: "Admin has been created!",
      data: admin,
    };
  }

  private async _checkExistingAdmin(email: string): Promise<void> {
    const admin: Admin | null = await this.prisma.admin.findUnique({ where: { email: email } });
    if(admin) throw new ConflictException("Admin already exists!")
  }
}