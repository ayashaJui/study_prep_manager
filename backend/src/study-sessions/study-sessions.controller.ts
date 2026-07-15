import { Controller, Get, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { StudySessionsService } from './study-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Study Sessions')
@ApiCookieAuth('auth_token')
@Controller('study-sessions')
@UseGuards(JwtAuthGuard)
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @Get('streak')
  getStreak(@CurrentUser() userId: string, @Query('tz') tz?: string) {
    return this.studySessionsService.getStreak(userId, tz);
  }

  // Uses @Res() directly to match the original response shape:
  // { success: true, data: sessions[], pagination: {...} }
  // The global interceptor would nest pagination inside data, so we bypass it here.
  @Get()
  async getHistory(
    @CurrentUser() userId: string,
    @Res() res: Response,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.studySessionsService.getHistory(
      userId,
      limit ? parseInt(limit) : 10,
      page ? parseInt(page) : 1,
    );
    res.json({ success: true, data: result.sessions, pagination: result.pagination });
  }

  @Post()
  create(@Body() body: any, @CurrentUser() userId: string) {
    return this.studySessionsService.create(userId, body);
  }
}
