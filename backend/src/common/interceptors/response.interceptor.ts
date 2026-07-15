/**
 * NESTJS CONCEPT — INTERCEPTOR
 *
 * An Interceptor wraps around the route handler execution, similar to
 * middleware but with access to both request AND response.
 *
 * This interceptor wraps every successful response in the standard envelope:
 *   { success: true, data: <whatever the controller returned> }
 *
 * This matches the format the Next.js frontend already expects.
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<any> {
    // next.handle() calls the actual route handler and returns an Observable.
    // map() transforms the emitted value before it reaches the HTTP response.
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}
