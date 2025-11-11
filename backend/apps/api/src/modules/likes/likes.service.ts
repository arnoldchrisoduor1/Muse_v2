import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Like a poem
   */
  async likePoem(userId: string, poemId: string) {
    // Check if poem exists
    const poem = await this.prisma.poem.findUnique({ where: { id: poemId } });
    if (!poem) {
      throw new NotFoundException('Poem not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('You already liked this poem');
    }

    // Create like and increment count in transaction
    await this.prisma.$transaction([
      this.prisma.like.create({
        data: { userId, poemId },
      }),
      this.prisma.poem.update({
        where: { id: poemId },
        data: { likes: { increment: 1 } },
      }),
    ]);

    return { message: 'Poem liked successfully' };
  }

  /**
   * Unlike a poem
   */
  async unlikePoem(userId: string, poemId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    // Delete like and decrement count in transaction
    await this.prisma.$transaction([
      this.prisma.like.delete({
        where: {
          userId_poemId: {
            userId,
            poemId,
          },
        },
      }),
      this.prisma.poem.update({
        where: { id: poemId },
        data: { likes: { decrement: 1 } },
      }),
    ]);

    return { message: 'Poem unliked successfully' };
  }

  /**
   * Check if user liked a poem
   */
  async hasLiked(userId: string, poemId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    return !!like;
  }

  /**
   * Get users who liked a poem
   */
  async getPoemLikes(poemId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { poemId },
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { poemId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: likes.map(like => like.user),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }
}