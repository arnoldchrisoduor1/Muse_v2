import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PoemMood, LicenseType, PoemStatus } from '@prisma/client';

export class SearchPoemsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: PoemMood, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PoemMood, { each: true })
  moods?: PoemMood[];

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minQualityScore?: number;

  @ApiPropertyOptional({ enum: ['recent', 'popular', 'quality', 'trending'] })
  @IsOptional()
  @IsString()
  sortBy?: 'recent' | 'popular' | 'quality' | 'trending';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}