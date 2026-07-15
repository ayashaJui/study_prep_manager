import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiCookieAuth('auth_token')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() userId: string) {
    return this.dashboardService.getStats(userId);
  }

  @Get('activity')
  getActivity(@CurrentUser() userId: string, @Query('limit') limit?: string) {
    return this.dashboardService.getActivity(userId, limit ? parseInt(limit) : 10);
  }

  @Get('progress')
  getProgress(@CurrentUser() userId: string) {
    return this.dashboardService.getProgress(userId);
  }

  @Get('goals')
  getGoals(@CurrentUser() userId: string) {
    return this.dashboardService.getGoals(userId);
  }

  @Put('goals')
  updateGoals(@CurrentUser() userId: string, @Body() body: { goals: any[] }) {
    return this.dashboardService.updateGoals(userId, body.goals);
  }
}
