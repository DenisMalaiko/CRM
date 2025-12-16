import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { MessageRolesToPrisma, MessageRolesUI } from "../../enums/MessageRoles";

@Injectable()
export class AiManagerService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async createSession(user: any) {
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        agencyId: user.businessId,
      },
      include: {
        user: true,
        messages: true,
      },
    });

    return {
      statusCode: 200,
      message: "Session has been created!",
      data: session,
    };
  }

  async getSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        messages: true
      }
    });

    return {
      statusCode: 200,
      message: "Sessions has been got!",
      data: sessions,
    };
  }

  async getSession(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      statusCode: 200,
      message: "Session has been got!",
      data: session,
    };
  }

  async sendMessage(user: any, message: any) {
    const response = await this.prisma.message.create({
      data: {
        agencyId: user.agencyId,
        ...message
      }
    });

    return {
      statusCode: 200,
      message: "Message has been sent!",
      data: response,
    };
  }

  async getMessages(sessionId: string) {
    const messages = await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      statusCode: 200,
      message: "Messages has been got!",
      data: messages,
    };
  }

  async deleteSession(sessionId: string) {

    return this.prisma.$transaction(async (tx) => {
      try {
        if (!sessionId) throw new NotFoundException('Session ID is required');

        await tx.message.deleteMany({ where: { sessionId } });

        const deleted = await tx.session.delete({ where: { id: sessionId } });

        return {
          statusCode: 200,
          message: 'Session has been deleted!',
          data: deleted,
        }
      } catch (err: any) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete session');
      }
    })
  }
}