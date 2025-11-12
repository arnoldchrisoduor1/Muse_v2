import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AiService } from '../ai/ai.service';
import { CreatePoemDto } from './dto/create-poem.dto';
import { UpdatePoemDto } from './dto/update-poem.dto';
import { SearchPoemsDto } from './dto/search-poems.dto';
import { PoemResponseDto } from './dto/poem-response.dto';
import { Prisma, PoemStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';

@Injectable()
export class PoemsService {
  private readonly logger = new Logger(PoemsService.name);
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private aiService: AiService,
  ) {}

  /**
   * Create a new poem
   */
  async create(userId: string, createPoemDto: CreatePoemDto): Promise<PoemResponseDto> {
    this.logger.log("Saving poem")
    // Generate excerpt (first 150 chars)
    const excerpt = this.generateExcerpt(createPoemDto.content);

    // Calculate reading time (average 200 words per minute)
    const readingTime = this.calculateReadingTime(createPoemDto.content);

    // Create content hash for integrity
    const contentHash = this.generateContentHash(createPoemDto.content);

    // Determine initial status
    const status = createPoemDto.publishNow ? PoemStatus.PUBLISHED : PoemStatus.DRAFT;
    const publishedAt = createPoemDto.publishNow ? new Date() : null;

    const poem = await this.prisma.poem.create({
      data: {
        title: createPoemDto.title,
        content: createPoemDto.content,
        excerpt,
        authorId: userId,
        isAnonymous: createPoemDto.isAnonymous || false,
        tags: createPoemDto.tags || [],
        mood: createPoemDto.mood,
        licenseType: createPoemDto.licenseType,
        status,
        publishedAt,
        contentHash,
        readingTime,
      },
      include: {
        author: true,
      },
    });

    this.logger.log("Poem saved successfully");

    // Update user's poem count if published
    if (status === PoemStatus.PUBLISHED) {
      await this.usersService.incrementPoemCount(userId);
    }

    return new PoemResponseDto(poem);
  }

  /**
 * Get AI feedback for a poem content without storing it (stateless)
 */

  async getStatelessAIFeedback(title: string, content: string) {

    this.logger.log("Attempting to get ai feedback");
    const feedback = await this.aiService.getPoemFeedback(title, content);
    this.logger.log("Response from AI service feedback received", feedback);

    // we'll calculate the final quality score.
    const qualityScore = this.aiService.calculateQualityScore(
      content,
      feedback,
    );

    // we then return this data.
    return {
      ...feedback,
      qualityScore,
      overallScore: feedback.overallScore,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      suggestions: feedback.suggestions,
    };
  }

  /**
   * Get AI feedback for a poem
   */
  async getAIFeedback(poemId: string, userId: string) {
    const poem = await this.findOne(poemId);

    // Check if user owns the poem
    if (poem.authorId !== userId) {
      throw new ForbiddenException('You can only get feedback on your own poems');
    }

    // Get AI feedback
    const feedback = await this.aiService.getPoemFeedback(poem.title, poem.content);

    // Calculate final quality score
    const qualityScore = this.aiService.calculateQualityScore(poem.content, feedback);

    // Store feedback in database
    const aiFeedback = await this.prisma.aIFeedback.create({
      data: {
        poemId: poem.id,
        overallScore: feedback.overallScore,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        suggestions: feedback.suggestions as any,
        processingTime: 0, // Will be updated with actual time
      },
    });

    // Update poem's quality score
    await this.prisma.poem.update({
      where: { id: poemId },
      data: { qualityScore },
    });

    return {
      ...aiFeedback,
      qualityScore,
    };
  }

  /**
   * Find all poems with filters and pagination
   */
  async findAll(searchDto: SearchPoemsDto) {
    const { page = 1, limit = 20, sortBy = 'recent', ...filters } = searchDto;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const orderBy = this.buildOrderByClause(sortBy);

    const [poems, total] = await Promise.all([
      this.prisma.poem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: true,
        },
      }),
      this.prisma.poem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: poems.map(poem => new PoemResponseDto(poem)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find one poem by ID
   */
  async findOne(id: string): Promise<any> {
    const poem = await this.prisma.poem.findUnique({
      where: { id },
      include: {
        author: true,
        collaborators: {
          include: {
            user: true,
          },
        },
        aiFeedback: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!poem) {
      throw new NotFoundException(`Poem with ID ${id} not found`);
    }

    // Increment view count (async, don't await)
    this.incrementViews(id).catch(err => console.error('Error incrementing views:', err));

    return poem;
  }

  /**
   * Get poems by user
   */
  async findByUser(userId: string, page: number = 1, limit: number = 20) {
  this.logger.log("🔄 Getting poems for user ID:", userId);
  
  // First, verify the user exists
  const user = await this.prisma.user.findUnique({
    where: { id: userId }
  });
  
  this.logger.log("👤 User found:", user ? `Yes (${user.username})` : 'No user found');
  
  const skip = (page - 1) * limit;

  const [poems, total] = await Promise.all([
    this.prisma.poem.findMany({
      where: {
        authorId: userId,
      },
      skip,
      take: limit,
      include: {
        author: true,
      },
    }),
    this.prisma.poem.count({
      where: {
        authorId: userId,
      },
    }),
  ]);

  this.logger.log("📊 Total poems found:", total);
  this.logger.log("📝 Poem items:", poems.map(p => ({ id: p.id, title: p.title, authorId: p.authorId })));

  return {
    items: poems.map(poem => new PoemResponseDto(poem)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrevious: page > 1,
  };
}

  /**
   * Get user's drafts
   */
  async findUserDrafts(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [poems, total] = await Promise.all([
      this.prisma.poem.findMany({
        where: {
          authorId: userId,
          status: PoemStatus.DRAFT,
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.poem.count({
        where: {
          authorId: userId,
          status: PoemStatus.DRAFT,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: poems.map(poem => new PoemResponseDto(poem)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Update poem
   */
  async update(id: string, userId: string, updatePoemDto: UpdatePoemDto): Promise<PoemResponseDto> {
    const poem = await this.findOne(id);

    // Check ownership
    if (poem.authorId !== userId) {
      throw new ForbiddenException('You can only update your own poems');
    }

    // Don't allow editing published poems (optional rule)
    // if (poem.status === PoemStatus.PUBLISHED) {
    //   throw new BadRequestException('Cannot edit published poems');
    // }

    const updateData: any = { ...updatePoemDto };

    // Recalculate excerpt if content changed
    if (updatePoemDto.content) {
      updateData.excerpt = this.generateExcerpt(updatePoemDto.content);
      updateData.readingTime = this.calculateReadingTime(updatePoemDto.content);
      updateData.contentHash = this.generateContentHash(updatePoemDto.content);
    }

    const updatedPoem = await this.prisma.poem.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
      },
    });

    return new PoemResponseDto(updatedPoem);
  }

  /**
   * Publish a draft poem
   */
  async publish(id: string, userId: string): Promise<PoemResponseDto> {
    const poem = await this.findOne(id);

    if (poem.authorId !== userId) {
      throw new ForbiddenException('You can only publish your own poems');
    }

    if (poem.status === PoemStatus.PUBLISHED) {
      throw new BadRequestException('Poem is already published');
    }

    const publishedPoem = await this.prisma.poem.update({
      where: { id },
      data: {
        status: PoemStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        author: true,
      },
    });

    // Increment user's poem count
    await this.usersService.incrementPoemCount(userId);

    return new PoemResponseDto(publishedPoem);
  }

  /**
   * Unpublish a poem (set back to draft)
   */
  async unpublish(id: string, userId: string): Promise<PoemResponseDto> {
    const poem = await this.findOne(id);

    if (poem.authorId !== userId) {
      throw new ForbiddenException('You can only unpublish your own poems');
    }

    const unpublishedPoem = await this.prisma.poem.update({
      where: { id },
      data: {
        status: PoemStatus.DRAFT,
      },
      include: {
        author: true,
      },
    });

    return new PoemResponseDto(unpublishedPoem);
  }

  /**
   * Delete poem
   */
  async remove(id: string, userId: string) {
    const poem = await this.findOne(id);

    if (poem.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own poems');
    }

    await this.prisma.poem.delete({
      where: { id },
    });

    return { message: 'Poem successfully deleted' };
  }

  /**
   * Increment view count
   */
  private async incrementViews(id: string): Promise<void> {
    await this.prisma.poem.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
    });
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string): string {
    const cleaned = content.replace(/\s+/g, ' ').trim();
    return cleaned.length > 150 ? cleaned.substring(0, 147) + '...' : cleaned;
  }

  /**
   * Calculate reading time in seconds
   */
  private calculateReadingTime(content: string): number {
    const words = content.split(/\s+/).length;
    const wordsPerMinute = 200;
    return Math.ceil((words / wordsPerMinute) * 60);
  }

  /**
   * Generate content hash for integrity verification
   */
  private generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Build where clause for search
   */
  private buildWhereClause(filters: any): Prisma.PoemWhereInput {
    const where: Prisma.PoemWhereInput = {
      status: PoemStatus.PUBLISHED, // Only show published poems
    };

    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { content: { contains: filters.query, mode: 'insensitive' } },
        { tags: { has: filters.query.toLowerCase() } },
      ];
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.moods && filters.moods.length > 0) {
      where.mood = {
        in: filters.moods,
      };
    }

    if (filters.minQualityScore !== undefined) {
      where.qualityScore = {
        gte: filters.minQualityScore,
      };
    }

    return where;
  }

  /**
   * Build order by clause for sorting
   */
  private buildOrderByClause(sortBy: string): Prisma.PoemOrderByWithRelationInput {
    switch (sortBy) {
      case 'popular':
        return { likes: 'desc' };
      case 'quality':
        return { qualityScore: 'desc' };
      case 'trending':
        // Simple trending: combination of recent + popular
        return { views: 'desc' };
      case 'recent':
      default:
        return { publishedAt: 'desc' };
    }
  }
}