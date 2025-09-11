import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { UserDto } from "./dto/user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor() {}

  async signUp(body: UserDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
      },
    });

    return {
      message: "User created successfully",
      userId: user.id,
    };
  }
}
