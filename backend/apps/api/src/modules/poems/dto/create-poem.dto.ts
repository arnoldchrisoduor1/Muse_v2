import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LicenseType, PoemMood } from '@prisma/client';

export class CreatePoemDto {
  @ApiProperty({ example: 'Digital Solitude' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'In pixels and code, I find my peace\nA digital soul, seeking release...',
  })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ type: [String], example: ['technology', 'solitude', 'digital'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: PoemMood, example: PoemMood.CONTEMPLATIVE })
  @IsOptional()
  @IsEnum(PoemMood)
  mood?: PoemMood;

  @ApiPropertyOptional({ enum: LicenseType, default: LicenseType.ALL_RIGHTS_RESERVED })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Publish immediately or save as draft' })
  @IsOptional()
  @IsBoolean()
  publishNow?: boolean;
}