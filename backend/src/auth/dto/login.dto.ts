/**
 * NESTJS CONCEPT — DTO (Data Transfer Object)
 *
 * A DTO is a plain class that describes the shape of incoming request data.
 * class-validator decorators (IsEmail, IsString, MinLength, etc.) define
 * validation rules. The global ValidationPipe in main.ts runs these
 * automatically before the controller method executes.
 *
 * If validation fails, NestJS throws a 400 BadRequestException automatically.
 * You never have to write "if (!email) return 400" by hand.
 */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}
