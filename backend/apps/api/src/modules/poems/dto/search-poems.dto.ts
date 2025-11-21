// modules/poems/dto/search-poems.dto.ts
import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PoemStatus, LicenseType, PoemMood } from '@prisma/client';

export class SearchPoemsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  themes?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(PoemMood, { each: true })
  moods?: PoemMood[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minQualityScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxQualityScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiProperty({ required: false, enum: PoemStatus })
  @IsOptional()
  @IsEnum(PoemStatus)
  status?: PoemStatus;

  @ApiProperty({ required: false, enum: LicenseType })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'recent';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}