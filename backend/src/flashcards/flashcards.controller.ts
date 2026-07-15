import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { FlashcardsService } from './flashcards.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Flashcards')
@ApiCookieAuth('auth_token')
@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get('import') // placeholder so route doesn't clash with :id
  importPlaceholder() { return []; }

  @Get()
  getAll(@CurrentUser() userId: string, @Query('topicId') topicId?: string) {
    return this.flashcardsService.getAll(userId, topicId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.flashcardsService.getById(id, userId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() userId: string) {
    return this.flashcardsService.create(userId, body);
  }

  @Post('import')
  importBulk(@Body() body: { topicId: string; flashcards: any[] }, @CurrentUser() userId: string) {
    return this.flashcardsService.importBulk(userId, body.topicId, body.flashcards);
  }

  @Post(':id/review')
  review(@Param('id') id: string, @Body() body: { quality: number }, @CurrentUser() userId: string) {
    return this.flashcardsService.review(id, userId, body.quality);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() userId: string) {
    return this.flashcardsService.update(id, userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.flashcardsService.delete(id, userId);
  }
}
