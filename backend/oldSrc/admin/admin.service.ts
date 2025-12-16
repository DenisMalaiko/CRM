import * as bcrypt from "bcrypt";
import * as process from "node:process";
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from "../prisma/prisma.service";
import { AdminDto } from "./dto/admin.dto";
import { Admin, AdminResponse } from "./entities/admin.entity";
import { CredentialsDto } from "../auth/dto/credentials.dto";
import { AuthResponse } from "../entities/authResponse.entity";
import { User, UserResponse } from "../auth/entities/user.entity";


@Injectable()
export class AdminService {
  private readonly SALT_ROUNDS: number = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  private readonly JWT_REFRESH_SECRET: string = String(process.env.JWT_REFRESH_SECRET ?? 'refresh-secret');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
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

  async signIn(body: CredentialsDto): Promise<ApiResponse<AuthResponse<AdminResponse>>> {
    if (!body?.email || !body?.password)
      throw new UnauthorizedException('Invalid credentials!');

    const response: Admin | null = await this.prisma.admin.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, name: true, password: true, isAdmin: true }
    });

    if (!response)
      throw new UnauthorizedException('Invalid credentials!');

    const isMatch = await bcrypt.compare(body.password, response.password);

    if (!isMatch)
      throw new UnauthorizedException('Invalid credentials!');

    const admin: AdminResponse = {
      id: response.id,
      email: response.email,
      name: response.name,
      isAdmin: response.isAdmin,
    };

    return await this._generateToken(admin);
  }

  private async _checkExistingAdmin(email: string): Promise<void> {
    const admin: Admin | null = await this.prisma.admin.findUnique({ where: { email: email } });
    if(admin) throw new ConflictException("Admin already exists!")
  }

  private async _generateToken(admin: AdminResponse): Promise<ApiResponse<AuthResponse<AdminResponse>>> {
    const accessToken: string = await this.jwt.signAsync(admin);
    const refreshToken: string = await this.jwt.signAsync(
      { ...admin, type: 'refresh' },
      { secret: this.JWT_REFRESH_SECRET, expiresIn: '10m' },
    );

    return {
      statusCode: 200,
      message: "Admin has been signed in!",
      data: {
        user: admin,
        accessToken,
        refreshToken,
      },
      error: null,
    }
  }
}