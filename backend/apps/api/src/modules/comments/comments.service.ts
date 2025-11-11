import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a comment
   */
  async create(userId: string, poemId: string, createCommentDto: CreateCommentDto) {
    // Check if poem exists
    const poem = await this.prisma.poem.findUnique({ where: { id: poemId } });
    if (!poem) {
      throw new NotFoundException('Poem not found');
    }

    // If replying to a comment, check if parent exists
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentCommentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
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
          user: true,
        },
      }),
      this.prisma.poem.update({
        where: { id: poemId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return comment;
  }

  /**
   * Get comments for a poem
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
          user: true,
          replies: {
            include: {
              user: true,
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

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: true,
      },
    });
  }

  /**
   * Delete a comment
   */
  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete comment and decrement count
    await this.prisma.$transaction([
      this.prisma.comment.delete({ where: { id } }),
      this.prisma.poem.update({
        where: { id: comment.poemId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Comment deleted successfully' };
  }
}