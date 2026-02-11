import * as bcrypt from "bcrypt";
import * as process from "node:process";
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from "../../core/prisma/prisma.service";
import { TAdmin, TAdminCreate} from "./entities/admin.entity";
import { AuthResponse } from "../../shared/entities/authResponse.entity";


@Injectable()
export class AdminService {
  private readonly SALT_ROUNDS: number = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  private readonly JWT_REFRESH_SECRET: string = String(process.env.JWT_REFRESH_SECRET ?? 'refresh-secret');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async signUp(body: TAdminCreate): Promise<TAdmin> {
    await this._checkExistingAdmin(body.email);

    const hashedPassword = await bcrypt.hash(body.password, this.SALT_ROUNDS);

    return await this.prisma.admin.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });
  }

  async signIn(body: any): Promise<AuthResponse<TAdmin>> {
    if (!body?.email || !body?.password)
      throw new UnauthorizedException('Invalid credentials!');

    const response = await this.prisma.admin.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, name: true, password: true }
    });

    if (!response)
      throw new UnauthorizedException('Invalid credentials!');

    const isMatch = await bcrypt.compare(body.password, response.password);

    if (!isMatch)
      throw new UnauthorizedException('Invalid credentials!');

    const admin: TAdmin = {
      id: response.id,
      email: response.email,
      name: response.name,
    };

    return await this._generateToken(admin);
  }

  private async _checkExistingAdmin(email: string): Promise<void> {
    const admin: TAdmin | null = await this.prisma.admin.findUnique({ where: { email: email } });
    if(admin) throw new ConflictException("Admin already exists!")
  }

  private async _generateToken(admin: TAdmin): Promise<AuthResponse<TAdmin>> {
    const accessToken: string = await this.jwt.signAsync(admin);
    const refreshToken: string = await this.jwt.signAsync(
      { ...admin, type: 'refresh' },
      { secret: this.JWT_REFRESH_SECRET, expiresIn: '10m' },
    );

    return {
      user: admin,
      accessToken,
      refreshToken,
    }
  }
}