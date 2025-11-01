import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
interface JwtPayload {
  sub: string;
  email?: string | null;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const cookieExtractor = (req: unknown) => {
      if (!req || typeof req !== 'object') return null;
      const r = req as { cookies?: Record<string, string> | undefined };
      return r.cookies?.access_token ?? null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email ?? null };
  }
}