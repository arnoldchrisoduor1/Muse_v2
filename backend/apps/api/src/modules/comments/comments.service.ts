// modules/comments/comments.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Logger } from '@nestjs/common';
import { Comment, Poem } from '@prisma/client';

interface CommentWithPoem extends Comment {
  poem: Poem;
}

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * Create a comment or reply
   */
  async create(userId: string, poemId: string, createCommentDto: CreateCommentDto) {
    // Check if poem exists
    const poem = await this.prisma.poem.findUnique({ where: { id: poemId } });
    if (!poem) {
      throw new NotFoundException('Poem not found');
    }

    // If replying to a comment, validate the parent
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentCommentId },
        include: { poem: true },
      }) as CommentWithPoem | null;

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Ensure parent comment belongs to the same poem
      if (parentComment.poemId !== poemId) {
        throw new BadRequestException('Parent comment does not belong to this poem');
      }

      // Prevent nested replies beyond one level (optional)
      if (parentComment.parentCommentId) {
        throw new BadRequestException('Cannot reply to a reply');
      }
    }

    // Create comment and increment count
    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          userId,
          poemId,
          parentCommentId: createCommentDto.parentCommentId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              isCollectiveContributor: true,
              verificationStatus: true,
            },
          },
          ...(createCommentDto.parentCommentId ? {
            parentComment: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          } : {}),
        },
      }),
      this.prisma.poem.update({
        where: { id: poemId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    this.logger.log(`Comment created by user ${userId} on poem ${poemId}`);

    return comment;
  }

  /**
   * Get comments for a poem with nested replies
   */
  async findByPoem(poemId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          poemId,
          parentCommentId: null, // Only top-level comments
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              isCollectiveContributor: true,
              verificationStatus: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  isCollectiveContributor: true,
                  verificationStatus: true,
                },
              },
              replies: { // Support nested replies (2 levels deep)
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatarUrl: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({
        where: {
          poemId,
          parentCommentId: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    this.logger.log(`Retrieved ${comments.length} comments for poem ${poemId}`);
    
    return {
      items: comments,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Get replies for a specific comment
   */
  async getReplies(commentId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Check if parent comment exists
    const parentComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const [replies, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          parentCommentId: commentId,
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              isCollectiveContributor: true,
              verificationStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.comment.count({
        where: {
          parentCommentId: commentId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: replies,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Update a comment
   */
  async update(id: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Don't allow changing parentCommentId after creation
    if (updateCommentDto.parentCommentId && updateCommentDto.parentCommentId !== comment.parentCommentId) {
      throw new BadRequestException('Cannot change comment parent');
    }

    this.logger.log(`Updating comment ${id} by user ${userId}`);

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
        // Only allow content updates, not structural changes
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isCollectiveContributor: true,
            verificationStatus: true,
          },
        },
      },
    });
  }

  /**
   * Delete a comment and its replies (cascade)
   */
  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ 
      where: { id },
      include: {
        replies: {
          select: { id: true }
        }
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const replyCount = comment.replies.length;
    const totalToDelete = 1 + replyCount; // Comment + its replies

    // Delete comment, its replies, and update poem count
    await this.prisma.$transaction([
      // Delete all replies first (due to foreign key constraints)
      ...(replyCount > 0 ? [
        this.prisma.comment.deleteMany({
          where: { parentCommentId: id }
        })
      ] : []),
      // Delete the main comment
      this.prisma.comment.delete({ where: { id } }),
      // Update poem comments count
      this.prisma.poem.update({
        where: { id: comment.poemId },
        data: { commentsCount: { decrement: totalToDelete } },
      }),
    ]);

    this.logger.log(`Deleted comment ${id} and ${replyCount} replies by user ${userId}`);

    return { 
      message: 'Comment and its replies deleted successfully',
      deletedCount: totalToDelete
    };
  }

  /**
   * Get a single comment with full context
   */
  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isCollectiveContributor: true,
            verificationStatus: true,
          },
        },
        poem: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 10, // Limit initial replies
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}