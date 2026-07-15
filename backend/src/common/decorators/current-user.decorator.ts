/**
 * NESTJS CONCEPT — CUSTOM DECORATOR
 *
 * @CurrentUser() is a parameter decorator. It lets you extract req.user
 * (set by JwtAuthGuard) directly in a controller method parameter.
 *
 * Without it:  @Get() getMe(@Req() req) { return req.user.userId; }
 * With it:     @Get() getMe(@CurrentUser() userId: string) { return userId; }
 *
 * createParamDecorator receives the execution context and returns whatever
 * you return from the factory function — here we extract just the userId string.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);
