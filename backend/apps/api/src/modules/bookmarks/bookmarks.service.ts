// modules/bookmarks/bookmarks.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger(BookmarksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Bookmark a poem
   */
  async bookmarkPoem(userId: string, poemId: string) {
    // Check if poem exists
    const poem = await this.prisma.poem.findUnique({
      where: { id: poemId },
    });

    if (!poem) {
      throw new NotFoundException(`Poem with ID ${poemId} not found`);
    }

    // Check if already bookmarked
    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Poem already bookmarked');
    }

    // Create bookmark and increment poem's bookmark count
    const [bookmark] = await this.prisma.$transaction([
      this.prisma.bookmark.create({
        data: {
          userId,
          poemId,
        },
      }),
      this.prisma.poem.update({
        where: { id: poemId },
        data: {
          bookmarks: { increment: 1 },
        },
      }),
    ]);

    this.logger.log(`User ${userId} bookmarked poem ${poemId}`);

    return bookmark;
  }

  /**
   * Remove bookmark from a poem
   */
  async unbookmarkPoem(userId: string, poemId: string) {
    // Check if bookmark exists
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    // Delete bookmark and decrement poem's bookmark count
    await this.prisma.$transaction([
      this.prisma.bookmark.delete({
        where: {
          userId_poemId: {
            userId,
            poemId,
          },
        },
      }),
      this.prisma.poem.update({
        where: { id: poemId },
        data: {
          bookmarks: { decrement: 1 },
        },
      }),
    ]);

    this.logger.log(`User ${userId} unbookmarked poem ${poemId}`);

    return { message: 'Bookmark removed successfully' };
  }

  /**
   * Check if user has bookmarked a poem
   */
  async hasBookmarked(userId: string, poemId: string): Promise<boolean> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_poemId: {
          userId,
          poemId,
        },
      },
    });

    return !!bookmark;
  }

  /**
   * Get user's bookmarked poems
   */
  async getUserBookmarks(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          poem: {
            include: {
              author: true,
              blockchainData: true,
            },
          },
        },
      }),
      this.prisma.bookmark.count({
        where: { userId },
      }),
    ]);

    const poems = bookmarks.map(bookmark => bookmark.poem);

    return {
      items: poems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get users who bookmarked a poem
   */
  async getPoemBookmarks(poemId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { poemId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.bookmark.count({
        where: { poemId },
      }),
    ]);

    return {
      bookmarks: bookmarks.map(bookmark => ({
        id: bookmark.id,
        user: bookmark.user,
        createdAt: bookmark.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrevious: page > 1,
    };
  }
}