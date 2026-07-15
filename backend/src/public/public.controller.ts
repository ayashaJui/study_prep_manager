// Public routes — no auth required
import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public/topics')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // Bypasses global interceptor so pagination sits at the top level:
  // { success: true, data: [...], pagination: {...} }
  @Get()
  async getAll(
    @Res() res: Response,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.publicService.getPublicTopics(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    res.json({ success: true, data: result.data, pagination: result.pagination });
  }

  @Get(':shareId')
  getByShareId(@Param('shareId') shareId: string) {
    return this.publicService.getPublicTopicByShareId(shareId);
  }
}
