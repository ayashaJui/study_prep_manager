/**
 * NESTJS CONCEPT — PASSPORT STRATEGY
 *
 * A Strategy tells Passport HOW to authenticate a request.
 * The JwtStrategy tells Passport:
 *   1. Where to find the JWT (our HttpOnly cookie named 'auth_token')
 *   2. What secret to use to verify its signature
 *   3. What to return as req.user after successful verification
 *
 * validate() runs after the token is verified. Whatever you return here
 * becomes req.user — available in controllers via @CurrentUser().
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      // Extract JWT from the HttpOnly cookie instead of Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.auth_token || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev-insecure-default-change-me',
    });
  }

  // Called after passport verifies the JWT signature.
  // payload is the decoded JWT body: { userId: "...", iat: ..., exp: ... }
  async validate(payload: { userId: string }) {
    if (!payload?.userId) throw new UnauthorizedException();
    // Return value becomes req.user
    return { userId: payload.userId };
  }
}
