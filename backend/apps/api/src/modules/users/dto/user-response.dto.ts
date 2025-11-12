import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserVerificationStatus, LicenseType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @Exclude()
  passwordHash?: string | null;

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

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
