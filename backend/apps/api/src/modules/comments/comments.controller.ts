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

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, user.id, updateCommentDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.remove(id, user.id);
  }
}