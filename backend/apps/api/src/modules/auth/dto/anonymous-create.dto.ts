import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserVerificationStatus, LicenseType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Exclude } from 'class-transformer';

export class UserAnonymousResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  passwordHash: string;

  @ApiProperty()
  anonymous: Boolean;

  @ApiPropertyOptional()
  walletAddress: string | null;

  @ApiProperty()
  bio: string;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty()
  website: string | null;

  @ApiProperty()
  twitter: string | null;

  @ApiProperty()
  instagram: string | null;

  @ApiProperty()
  coverImageUrl: string | null;

  @ApiProperty()
  reputation: number;

  @ApiProperty()
  totalPoems: number;

  @ApiProperty()
  totalCollaborations: number;

  @ApiProperty()
  totalEarnings: Decimal;

  @ApiProperty()
  followersCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  isCollectiveContributor: boolean;

  @ApiProperty({ enum: UserVerificationStatus })
  verificationStatus: UserVerificationStatus;

  @ApiProperty()
  allowRemixes: boolean;

  @ApiProperty({ enum: LicenseType })
  defaultLicenseType: LicenseType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<UserAnonymousResponseDto>) {
    Object.assign(this, partial);
  }
}
