import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {Request} from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      request['user'] = await this.jwt.verifyAsync(token);
      return true;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          data: null,
          statusCode: 401,
          message: 'ACCESS_TOKEN_EXPIRED',
          error: 'Unauthorized',
        });
      }

      throw new UnauthorizedException({
        data: null,
        statusCode: 401,
        message: 'ACCESS_TOKEN_INVALID',
        error: 'Unauthorized',
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    console.log("AUTH HEADER ", authHeader);

    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}