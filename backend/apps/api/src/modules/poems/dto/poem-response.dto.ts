import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PoemStatus, LicenseType, PoemMood } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class PoemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  excerpt: string;

  @ApiProperty()
  authorId: string;

  @ApiPropertyOptional({ type: UserResponseDto })
  author?: UserResponseDto;

  @ApiProperty()
  isAnonymous: boolean;

  @ApiPropertyOptional()
  anonymousCommitment?: string | null;

  @ApiProperty()
  isCollaborative: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  publishedAt: Date | null;

  @ApiPropertyOptional()
  contentHash: string | null;

  @ApiPropertyOptional()
  blockchainTxHash: string | null;

  @ApiPropertyOptional()
  nftTokenId: string | null;

  @ApiPropertyOptional()
  nftContractAddress: string | null;

  @ApiProperty()
  views: number;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  commentsCount: number;

  @ApiProperty()
  shares: number;

  @ApiProperty()
  bookmarks: number;

  @ApiPropertyOptional()
  qualityScore: number | null;

  @ApiProperty()
  contributedToCollective: boolean;

  @ApiPropertyOptional()
  collectiveInclusionDate: Date | null;

  @ApiPropertyOptional()
  parentPoemId: string | null;

  @ApiProperty({ enum: LicenseType })
  licenseType: LicenseType;

  @ApiPropertyOptional()
  commercialUsePrice: string | null;

  @ApiProperty({ enum: PoemStatus })
  status: PoemStatus;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiPropertyOptional({ enum: PoemMood })
  mood: PoemMood | null;

  @ApiProperty()
  readingTime: number;

  constructor(partial: Partial<PoemResponseDto>) {
    Object.assign(this, partial);
  }
}