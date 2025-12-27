import * as bcrypt from 'bcrypt';
import * as process from "node:process";
import { JwtService } from '@nestjs/jwt';
import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from "../prisma/prisma.service";
import { AuthResponse } from "../entities/authResponse.entity";
import { TUser, TUserSignIn, TSignUpPayload, TSignInPayload } from "./entities/user.entity";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS: number = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  private readonly JWT_REFRESH_SECRET: string = String(process.env.JWT_REFRESH_SECRET ?? 'refresh-secret');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async signUp(body: TSignUpPayload): Promise<ApiResponse<TUser>> {
    return this.prisma.$transaction(async (tx) => {
      try {
        await this._checkExistingUser(body.user?.email);

        const agency = await tx.agency.create({
          data: {
            name: body.agency.name,
            plan: body.agency.plan,
          },
        });

        const hashedPassword = await bcrypt.hash(body.user.password, this.SALT_ROUNDS);

        const user: TUser = await tx.user.create({
          data: {
            name: body.user.name,
            email: body.user.email,
            password: hashedPassword,
            role: body.user.role,
            status: body.user.status,
            agencyId: agency.id,
          },
          select: {
            id: true,
            agencyId: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        });

        return {
          statusCode: 200,
          message: "User has been created!",
          data: user,
        };

      } catch(err) {
        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to sign up user');
      }
    })
  }

  async signIn(body: TSignInPayload): Promise<ApiResponse<AuthResponse<TUser>>> {
    if (!body?.email || !body?.password) throw new UnauthorizedException('Invalid credentials!');

    const response: TUserSignIn | null = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, agencyId: true, name: true, email: true, password: true, role: true, status: true, }
    });
    if (!response) throw new UnauthorizedException('Invalid credentials!');

    const isMatch = await bcrypt.compare(body.password, response.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials!');

    const user: TUser = {
      id: response.id,
      agencyId: response.agencyId,
      email: response.email,
      name: response.name,
      role: response.role,
      status: response.status
    };

    return await this._generateToken(user);
  }

  async me(body: TUser) {
    try {
      const response: TUser | null = await this.prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, agencyId: true, email: true, name: true, password: true, role: true, status: true }
      });
      if (!response) throw new UnauthorizedException('Invalid credentials!');

      const user: TUser = {
        id: response.id,
        email: response.email,
        name: response.name,
        agencyId: response.agencyId,
        role: response.role,
        status: response.status
      };

      return await this._generateToken(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid credentials!');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.id } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return await this._generateToken(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token!');
    }
  }

  private async _checkExistingUser(email: string): Promise<void> {
    const user: TUser | null = await this.prisma.user.findUnique({ where: { email: email } });

    if(user) {
      throw new ConflictException("User already exists!")
    }
  }

  private async _generateToken(user: TUser): Promise<ApiResponse<AuthResponse<TUser>>> {
    const accessToken: string = await this.jwt.signAsync(user);
    const refreshToken: string = await this.jwt.signAsync(
      { ...user, type: 'refresh' },
      { secret: this.JWT_REFRESH_SECRET, expiresIn: '1d' },
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
