/**
 * NESTJS CONCEPT — GUARD
 *
 * A Guard is a class decorated with @Injectable() that implements CanActivate.
 * Guards decide whether a request should be handled or rejected (401/403).
 *
 * This guard reads the JWT from the HttpOnly cookie, verifies it, and
 * attaches the decoded user payload to req.user so controllers can access it.
 *
 * To protect a route, add @UseGuards(JwtAuthGuard) above the controller method.
 * To protect every route in a controller, add it above the @Controller() class.
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // canActivate runs before the route handler.
  // Calling super.canActivate() delegates to Passport's JWT strategy.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  // handleRequest is called after Passport resolves the user.
  // If Passport throws or user is null, we throw UnauthorizedException.
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
