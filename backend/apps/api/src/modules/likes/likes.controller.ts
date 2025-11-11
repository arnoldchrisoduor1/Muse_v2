import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('likes')
@Controller('poems/:poemId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a poem' })
  @ApiResponse({ status: 200, description: 'Poem liked successfully' })
  @ApiResponse({ status: 409, description: 'Already liked' })
  async likePoem(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
  ) {
    return this.likesService.likePoem(user.id, poemId);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a poem' })
  @ApiResponse({ status: 200, description: 'Poem unliked successfully' })
  async unlikePoem(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
  ) {
    return this.likesService.unlikePoem(user.id, poemId);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get users who liked this poem' })
  @ApiResponse({ status: 200, description: 'Likes retrieved' })
  async getPoemLikes(
    @Param('poemId') poemId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.likesService.getPoemLikes(poemId, page, limit);
  }

  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user liked this poem' })
  @ApiResponse({ status: 200, description: 'Returns boolean' })
  async hasLiked(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
  ) {
    const hasLiked = await this.likesService.hasLiked(user.id, poemId);
    return { hasLiked };
  }
}