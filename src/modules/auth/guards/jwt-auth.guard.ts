import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { UserSuspendedException } from '../exceptions/auth.exceptions';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);

      request['user'] = payload;

      const user = await this.usersService.findOne(payload.sub).catch(() => null);
      if (user?.isSuspend) {
        throw new UserSuspendedException();
      }
    } catch (error) {
      if (error instanceof UserSuspendedException) throw error;
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
