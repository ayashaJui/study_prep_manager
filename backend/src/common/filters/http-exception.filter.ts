/**
 * NESTJS CONCEPT — EXCEPTION FILTER
 *
 * An Exception Filter catches errors thrown anywhere in the app and decides
 * how to format the HTTP error response.
 *
 * Without this, NestJS would return its own default error shape.
 * With this, every error returns: { success: false, message: "...", statusCode: NNN }
 * which matches what the frontend's fetchAPI() already parses.
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch() // @Catch() with no arguments catches ALL exceptions
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      // class-validator returns an array of messages — join them
      if (Array.isArray(message)) message = message.join(', ');
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({ success: false, message, statusCode: status });
  }
}
