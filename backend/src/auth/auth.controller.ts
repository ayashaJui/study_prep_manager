/**
 * NESTJS CONCEPT — CONTROLLER
 *
 * A Controller maps HTTP routes to methods. Decorators tell NestJS what
 * HTTP method and path each method handles:
 *
 *   @Get('me')   → GET /api/auth/me
 *   @Post('login') → POST /api/auth/login
 *
 * Controllers should be thin: parse the request, call the service, return data.
 * Business logic lives in the service, not here.
 *
 * @Controller('auth') sets the route prefix for all methods in this class.
 * Combined with the global prefix 'api' set in main.ts → /api/auth/...
 */
import {
  Controller, Get, Post, Body, Res, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // NestJS injects AuthService here automatically (Dependency Injection)
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login
  @Post('login')
  @HttpCode(200) // NestJS defaults POST to 201; override to 200 for login
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    res.setHeader('Set-Cookie', result.cookie);
    return result.data;
  }

  // POST /api/auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto.name, dto.email, dto.password, dto.confirmPassword);
    res.setHeader('Set-Cookie', result.cookie);
    return result.data;
  }

  // POST /api/auth/logout
  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Set-Cookie', this.authService.buildClearCookieHeader());
    return null;
  }

  // GET /api/auth/me  — protected: requires valid JWT cookie
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() userId: string) {
    return this.authService.getMe(userId);
  }

  // GET /api/auth/profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() userId: string) {
    return this.authService.getProfile(userId);
  }

  // POST /api/auth/forgot-password
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // POST /api/auth/reset-password
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password, dto.confirmPassword);
  }

  // POST /api/auth/change-password
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() userId: string) {
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword, dto.confirmPassword);
  }
}
