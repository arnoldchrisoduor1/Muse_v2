import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { VoteType } from '@prisma/client';

@Injectable()
export class CommentVotesService {
  private readonly logger = new Logger(CommentVotesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Vote on a comment
   */
  async voteOnComment(userId: string, commentId: string, voteType: VoteType) {
    // Check if comment exists
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user already voted
    const existingVote = await this.prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    return await this.prisma.$transaction(async (tx) => {
      if (existingVote) {
        // If same vote type, remove the vote
        if (existingVote.type === voteType) {
          return await this.removeVote(tx, userId, commentId, voteType);
        } else {
          // If different vote type, update the vote
          return await this.updateVote(tx, userId, commentId, voteType, existingVote.type);
        }
      } else {
        // Create new vote
        return await this.createVote(tx, userId, commentId, voteType);
      }
    });
  }

  private async createVote(tx: any, userId: string, commentId: string, voteType: VoteType) {
    const [vote] = await Promise.all([
      tx.commentVote.create({
        data: {
          userId,
          commentId,
          type: voteType,
        },
      }),
      tx.comment.update({
        where: { id: commentId },
        data: {
          upvotes: { increment: voteType === 'UP' ? 1 : 0 },
          downvotes: { increment: voteType === 'DOWN' ? 1 : 0 },
          netVotes: { increment: voteType === 'UP' ? 1 : -1 },
        },
      }),
    ]);

    this.logger.log(`User ${userId} ${voteType}voted comment ${commentId}`);
    return vote;
  }

  private async updateVote(tx: any, userId: string, commentId: string, newVoteType: VoteType, oldVoteType: VoteType) {
    const [vote] = await Promise.all([
      tx.commentVote.update({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
        data: {
          type: newVoteType,
        },
      }),
      tx.comment.update({
        where: { id: commentId },
        data: {
          upvotes: { 
            increment: (newVoteType === 'UP' ? 1 : 0) - (oldVoteType === 'UP' ? 1 : 0)
          },
          downvotes: { 
            increment: (newVoteType === 'DOWN' ? 1 : 0) - (oldVoteType === 'DOWN' ? 1 : 0)
          },
          netVotes: { 
            increment: (newVoteType === 'UP' ? 1 : -1) - (oldVoteType === 'UP' ? 1 : -1)
          },
        },
      }),
    ]);

    this.logger.log(`User ${userId} changed vote from ${oldVoteType} to ${newVoteType} on comment ${commentId}`);
    return vote;
  }

  private async removeVote(tx: any, userId: string, commentId: string, voteType: VoteType) {
    await Promise.all([
      tx.commentVote.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      }),
      tx.comment.update({
        where: { id: commentId },
        data: {
          upvotes: { decrement: voteType === 'UP' ? 1 : 0 },
          downvotes: { decrement: voteType === 'DOWN' ? 1 : 0 },
          netVotes: { increment: voteType === 'UP' ? -1 : 1 },
        },
      }),
    ]);

    this.logger.log(`User ${userId} removed ${voteType} vote from comment ${commentId}`);
    return { message: 'Vote removed' };
  }

  /**
   * Get user's vote on a comment
   */
  async getUserVote(userId: string, commentId: string) {
    const vote = await this.prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    return vote ? vote.type : null;
  }

  /**
   * Remove user's vote from a comment
   */
  async removeVoteFromComment(userId: string, commentId: string) {
    const vote = await this.prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    return await this.removeVote(this.prisma, userId, commentId, vote.type);
  }
}