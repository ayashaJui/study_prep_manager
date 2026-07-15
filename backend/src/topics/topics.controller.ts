import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Topics')
@ApiCookieAuth('auth_token')
@Controller('topics')
@UseGuards(JwtAuthGuard) // Protect every route in this controller
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  // GET /api/topics  or  GET /api/topics?parentId=X  or  ?favorite=true
  @Get()
  getAll(
    @CurrentUser() userId: string,
    @Query('parentId') parentId?: string,
    @Query('favorite') favorite?: string,
  ) {
    return this.topicsService.getAll(userId, parentId, favorite === 'true');
  }

  // GET /api/topics/slug/:slug
  @Get('slug/:slug')
  getBySlug(
    @Param('slug') slug: string,
    @CurrentUser() userId: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.topicsService.getBySlug(slug, userId, parentId);
  }

  // GET /api/topics/:id
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.topicsService.getById(id, userId);
  }

  // POST /api/topics
  @Post()
  create(@Body() body: any, @CurrentUser() userId: string) {
    return this.topicsService.create({ ...body, userId });
  }

  // PATCH /api/topics/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser() userId: string) {
    return this.topicsService.update(id, userId, body);
  }

  // DELETE /api/topics/:id  or  DELETE /api/topics/:id?recursive=true
  @Delete(':id')
  @HttpCode(200)
  delete(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Query('recursive') recursive?: string,
  ) {
    return this.topicsService.delete(id, userId, recursive === 'true');
  }

  // POST /api/topics/:id/share
  @Post(':id/share')
  publish(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.topicsService.publish(id, userId);
  }

  // DELETE /api/topics/:id/share
  @Delete(':id/share')
  @HttpCode(200)
  unpublish(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.topicsService.unpublish(id, userId);
  }
}
