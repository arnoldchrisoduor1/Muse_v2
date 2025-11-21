import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PoemsService } from './poems.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('poems')
@Controller('poems')
export class PoemsDiscoveryController {
  constructor(private readonly poemsService: PoemsService) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending poems' })
  async getTrendingPoems(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.poemsService.getTrendingPoems(limit, page);
  }

  @Public()
  @Get('recent')
  @ApiOperation({ summary: 'Get recent poems' })
  async getRecentPoems(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.poemsService.getRecentPoems(limit, page);
  }
}