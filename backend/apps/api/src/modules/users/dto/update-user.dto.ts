import { IsString, IsOptional, MaxLength, IsBoolean, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LicenseType } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowRemixes?: boolean;

  @ApiPropertyOptional({ enum: LicenseType })
  @IsOptional()
  @IsEnum(LicenseType)
  defaultLicenseType?: LicenseType;
}