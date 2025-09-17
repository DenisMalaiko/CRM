import * as bcrypt from 'bcrypt';
import * as process from "node:process";

import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { UserDto } from "./dto/user.dto";
import { User, UserResponse } from "./entities/user.entity";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS: number = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  constructor(private readonly prisma: PrismaService) {}

  async signUp(body: UserDto): Promise<ApiResponse<UserResponse>> {
    await this._checkExistingUser(body.email);

    const hashedPassword = await bcrypt.hash(body.password, this.SALT_ROUNDS);

    const user: UserResponse = await this.prisma.user.create({
      data: { email: body.email, name: body.name, password: hashedPassword },
      select: { id: true, email: true, name: true }
    });

    return {
      statusCode: 200,
      message: "User has been successfully created!",
      data: user,
    };
  }

  private async _checkExistingUser(email: string): Promise<void> {
    const user: User | null = await this.prisma.user.findUnique({ where: { email: email } });
    if(user) throw new ConflictException("User already exists!")
  }
}
