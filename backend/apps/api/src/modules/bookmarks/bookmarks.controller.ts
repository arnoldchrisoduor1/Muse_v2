// modules/bookmarks/bookmarks.controller.ts
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
import { BookmarksService } from './bookmarks.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('bookmarks')
@Controller('poems/:poemId/bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bookmark a poem' })
  @ApiResponse({ status: 200, description: 'Poem bookmarked successfully' })
  @ApiResponse({ status: 409, description: 'Already bookmarked' })
  async bookmarkPoem(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
  ) {
    return this.bookmarksService.bookmarkPoem(user.id, poemId);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove bookmark from a poem' })
  @ApiResponse({ status: 200, description: 'Bookmark removed successfully' })
  async unbookmarkPoem(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
  ) {
    return this.bookmarksService.unbookmarkPoem(user.id, poemId);
  }

  @Get('check')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user bookmarked this poem' })
  @ApiResponse({ status: 200, description: 'Returns boolean' })
  async hasBookmarked(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
  ) {
    const hasBookmarked = await this.bookmarksService.hasBookmarked(user.id, poemId);
    return { hasBookmarked };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get users who bookmarked this poem' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved' })
  async getPoemBookmarks(
    @Param('poemId') poemId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.bookmarksService.getPoemBookmarks(poemId, page, limit);
  }
}

// Also add a separate controller for user bookmarks
@ApiTags('bookmarks')
@Controller('users/:userId/bookmarks')
export class UserBookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user\'s bookmarked poems' })
  @ApiResponse({ status: 200, description: 'Bookmarks retrieved' })
  async getUserBookmarks(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() currentUser?: any,
  ) {
    // Users can only see their own bookmarks
    if (currentUser && currentUser.id !== userId) {
      throw new Error('Cannot view another user\'s bookmarks');
    }
    
    return this.bookmarksService.getUserBookmarks(userId, page, limit);
  }
}