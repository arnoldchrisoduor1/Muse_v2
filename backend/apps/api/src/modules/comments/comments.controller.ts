// modules/comments/comments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('comments')
@Controller('poems/:poemId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a comment on a poem' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Poem or parent comment not found' })
  async create(
    @Param('poemId') poemId: string,
    @CurrentUser() user: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.id, poemId, createCommentDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get comments for a poem' })
  @ApiResponse({ status: 200, description: 'Comments retrieved' })
  async findByPoem(
    @Param('poemId') poemId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.findByPoem(poemId, page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment with context' })
  @ApiResponse({ status: 200, description: 'Comment retrieved' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Public()
  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies for a comment' })
  @ApiResponse({ status: 200, description: 'Replies retrieved' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getReplies(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.getReplies(id, page, limit);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this comment' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.id, updateCommentDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment and its replies' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this comment' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.remove(id, user.id);
  }
}