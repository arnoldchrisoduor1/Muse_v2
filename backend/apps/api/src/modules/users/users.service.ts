import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    this.logger.log("Creating User account");
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
        bio: createUserDto.bio || '',
      },
    });
    this.logger.log("Account created successfully");

    return new UserResponseDto(user);
  }

  /**
   * Find all users with pagination
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.getUserSelectFields(),
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.getUserSelectFields(),
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<UserResponseDto> {
    this.logger.log("Getting user by username");
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: this.getUserSelectFields(),
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    this.logger.log("User by username found: ", user);
    return new UserResponseDto(user);
  }

  /**
   * Find user by email (for auth)
   */
  async findByEmail(email: string) {
    this.logger.log("Finding user by email");
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by wallet address
   */
  async findByWalletAddress(walletAddress: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
      select: this.getUserSelectFields(),
    });

    if (!user) {
      throw new NotFoundException(
        `User with wallet address ${walletAddress} not found`,
      );
    }

    return new UserResponseDto(user);
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: this.getUserSelectFields(),
    });

    return new UserResponseDto(user);
  }

  /**
   * Connect wallet to user account
   */
  async connectWallet(id: string, walletAddress: string): Promise<UserResponseDto> {
    // Check if wallet is already connected to another user
    const existingWallet = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (existingWallet && existingWallet.id !== id) {
      throw new ConflictException('Wallet already connected to another account');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { walletAddress },
      select: this.getUserSelectFields(),
    });

    return new UserResponseDto(user);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Increment poem count
   */
  async incrementPoemCount(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        totalPoems: { increment: 1 },
      },
    });
  }

  /**
   * Increment collaboration count
   */
  async incrementCollaborationCount(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        totalCollaborations: { increment: 1 },
      },
    });
  }

  /**
   * Update earnings
   */
  async addEarnings(id: string, amount: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        totalEarnings: { increment: amount },
      },
    });
  }

  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Check if both users exist
    await Promise.all([this.findOne(followerId), this.findOne(followingId)]);

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create follow relationship and update counts in a transaction
    await this.prisma.$transaction([
      this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Successfully followed user' };
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    // Delete follow relationship and update counts in a transaction
    await this.prisma.$transaction([
      this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      }),
      this.prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
      this.prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Successfully unfollowed user' };
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    await this.findOne(userId); // Check if user exists

    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: this.getUserSelectFields(),
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: followers.map((f) => new UserResponseDto(f.follower)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Get users that this user is following
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    await this.findOne(userId); // Check if user exists

    const skip = (page - 1) * limit;

    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: this.getUserSelectFields(),
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: following.map((f) => new UserResponseDto(f.following)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }

  /**
   * Delete user (soft delete - we might want to keep data)
   */
  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User successfully deleted' };
  }

  /**
   * Search users by username or bio
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: this.getUserSelectFields(),
        orderBy: { reputation: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Get top users by reputation
   */
  async getTopUsers(limit: number = 10) {
    const users = await this.prisma.user.findMany({
      take: limit,
      select: this.getUserSelectFields(),
      orderBy: { reputation: 'desc' },
    });

    return users.map((user) => new UserResponseDto(user));
  }

  /**
   * Helper: Select fields for user (exclude sensitive data)
   */
  private getUserSelectFields() {
    return {
      id: true,
      username: true,
      email: true,
      passwordHash: true, // We'll exclude this in DTO
      walletAddress: true,
      bio: true,
      avatarUrl: true,
      reputation: true,
      totalPoems: true,
      totalCollaborations: true,
      totalEarnings: true,
      followersCount: true,
      followingCount: true,
      isCollectiveContributor: true,
      verificationStatus: true,
      allowRemixes: true,
      defaultLicenseType: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    };
  }
}