import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { ProblemsService } from './problems.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Problems')
@ApiCookieAuth('auth_token')
@Controller('problems')
@UseGuards(JwtAuthGuard)
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  getAll(
    @CurrentUser() userId: string,
    @Query('topicId') topicId?: string,
    @Query('status') status?: string,
    @Query('difficulty') difficulty?: string,
    @Query('platform') platform?: string,
    @Query('tag') tag?: string,
    @Query('due') due?: string,
  ) {
    return this.problemsService.getAll(userId, { topicId, status, difficulty, platform, tag, due: due === 'true' });
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.problemsService.getById(id, userId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() userId: string) {
    return this.problemsService.create(userId, body);
  }

  @Post(':id/review')
  review(@Param('id') id: string, @Body() body: { confidence: 'easy' | 'medium' | 'hard' | 'again' }, @CurrentUser() userId: string) {
    return this.problemsService.review(id, userId, body.confidence);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() userId: string) {
    return this.problemsService.update(id, userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.problemsService.delete(id, userId);
  }
}
