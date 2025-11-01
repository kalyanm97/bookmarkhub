import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest() as { cookies?: Record<string, string>; user?: { id?: string; email?: string; username?: string } };
    const token: string | undefined = req?.cookies?.access_token;
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
      // Normalize user object so controllers can rely on `user.id`, `user.email`, and `user.username`.
      req.user = { id: payload.sub, email: payload.email, username: payload.username } as { id: string; email?: string; username?: string };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}