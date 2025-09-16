import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { UserDto } from "./dto/user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor() {}

  async signUp(body: UserDto) {
    console.log("START signUp")

    const hashedPassword = await bcrypt.hash(body.password, 10);
    console.log("Hashed password: ", hashedPassword)

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
      },
    });

    console.log("User: ", user)

    return {
      message: "User created successfully",
      userId: user.id,
    };
  }
}
