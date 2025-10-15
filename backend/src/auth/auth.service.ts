import * as bcrypt from 'bcrypt';
import * as process from "node:process";
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from "../prisma/prisma.service";
import { UserDto } from "./dto/user.dto";
import { CredentialsDto } from "./dto/credentials.dto";

import { User, UserResponse } from "./entities/user.entity";
import {AuthResponse} from "../entities/authResponse.entity";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS: number = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  private readonly JWT_REFRESH_SECRET: string = String(process.env.JWT_REFRESH_SECRET ?? 'refresh-secret');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async signUp(body: UserDto): Promise<ApiResponse<UserResponse>> {
    await this._checkExistingUser(body.email);

    const hashedPassword = await bcrypt.hash(body.password, this.SALT_ROUNDS);

    const user: UserResponse = await this.prisma.user.create({
      data: { email: body.email, name: body.name, businessId: body.businessId, password: hashedPassword },
      select: { id: true, email: true, name: true, businessId: true }
    });

    return {
      statusCode: 200,
      message: "User has been created!",
      data: user,
    };
  }

  async signIn(body: CredentialsDto): Promise<ApiResponse<AuthResponse<UserResponse>>> {
    if (!body?.email || !body?.password)
      throw new UnauthorizedException('Invalid credentials!');

    const response: User | null = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, name: true, password: true, businessId: true }
    });

    if (!response)
      throw new UnauthorizedException('Invalid credentials!');

    const isMatch = await bcrypt.compare(body.password, response.password);

    if (!isMatch)
      throw new UnauthorizedException('Invalid credentials!');

    const user: UserResponse = {
      id: response.id,
      email: response.email,
      name: response.name,
      businessId: response.businessId
    };

    return await this._generateToken(user);
  }

  private async _checkExistingUser(email: string): Promise<void> {
    const user: User | null = await this.prisma.user.findUnique({ where: { email: email } });
    if(user) throw new ConflictException("User already exists!")
  }

  private async _generateToken(user: UserResponse): Promise<ApiResponse<AuthResponse<UserResponse>>> {
    const accessToken: string = await this.jwt.signAsync(user);
    const refreshToken: string = await this.jwt.signAsync(
      { ...user, type: 'refresh' },
      { secret: this.JWT_REFRESH_SECRET, expiresIn: '10m' },
    );

    return {
      statusCode: 200,
      message: "User has been signed in!",
      data: {
        user: user,
        accessToken,
        refreshToken,
      },
      error: null,
    }
  }
}
