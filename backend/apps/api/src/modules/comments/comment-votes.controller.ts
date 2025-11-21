import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentVotesService } from './comment-votes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('comments')
@Controller('comments/:commentId/votes')
export class CommentVotesController {
  constructor(private readonly commentVotesService: CommentVotesService) {}

  @Post('up')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upvote a comment' })
  @ApiResponse({ status: 200, description: 'Comment upvoted successfully' })
  async upvoteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.commentVotesService.voteOnComment(user.id, commentId, 'UP');
  }

  @Post('down')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Downvote a comment' })
  @ApiResponse({ status: 200, description: 'Comment downvoted successfully' })
  async downvoteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.commentVotesService.voteOnComment(user.id, commentId, 'DOWN');
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove vote from a comment' })
  @ApiResponse({ status: 200, description: 'Vote removed successfully' })
  async removeVote(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    return this.commentVotesService.removeVoteFromComment(user.id, commentId);
  }

  @Get('my-vote')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s vote on a comment' })
  @ApiResponse({ status: 200, description: 'Vote status retrieved' })
  async getMyVote(
    @Param('commentId') commentId: string,
    @CurrentUser() user: any,
  ) {
    const voteType = await this.commentVotesService.getUserVote(user.id, commentId);
    return { voteType };
  }
}