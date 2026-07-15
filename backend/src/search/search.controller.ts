import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Search')
@ApiCookieAuth('auth_token')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @CurrentUser() userId: string,
    @Query('query') query = '',
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search(userId, query.trim(), limit ? parseInt(limit) : 10);
  }
}
