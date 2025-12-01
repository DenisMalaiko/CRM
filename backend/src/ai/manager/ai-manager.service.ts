import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { MessageRolesToPrisma, MessageRolesUI } from "../../enums/MessageRoles";

@Injectable()
export class AiManagerService {
  constructor(
    private readonly prisma: PrismaService
  ) {}


  async createSession(userId: string) {
    console.log("CREATE SESSION");

    /*return await this.prisma.session.create({
      data: { userId: userId }
    });*/
  }
}