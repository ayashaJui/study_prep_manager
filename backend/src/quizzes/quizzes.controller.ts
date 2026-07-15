import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Quizzes')
@ApiCookieAuth('auth_token')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('analytics')
  getAnalytics(@CurrentUser() userId: string, @Query('topicId') topicId: string) {
    return this.quizzesService.getAnalytics(userId, topicId);
  }

  @Get()
  getAll(@CurrentUser() userId: string, @Query('topicId') topicId: string) {
    return this.quizzesService.getAll(userId, topicId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.quizzesService.getById(id, userId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() userId: string) {
    return this.quizzesService.create(userId, body);
  }

  @Post('import')
  importBulk(@Body() body: { topicId: string; quizzes: any[] }, @CurrentUser() userId: string) {
    return this.quizzesService.importBulk(userId, body.topicId, body.quizzes);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body() body: { answers: any[]; timeTaken: number },
    @CurrentUser() userId: string,
  ) {
    return this.quizzesService.submit(id, userId, body.answers, body.timeTaken);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() userId: string) {
    return this.quizzesService.update(id, userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.quizzesService.delete(id, userId);
  }
}
