import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notes')
@ApiCookieAuth('auth_token')
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('pinned')
  getPinned(@CurrentUser() userId: string) {
    return this.notesService.getPinned(userId);
  }

  @Get()
  getAll(@CurrentUser() userId: string, @Query('topicId') topicId: string) {
    return this.notesService.getAll(userId, topicId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.notesService.getById(id, userId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() userId: string) {
    return this.notesService.create(userId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() userId: string) {
    return this.notesService.update(id, userId, body);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.notesService.delete(id, userId);
  }
}
