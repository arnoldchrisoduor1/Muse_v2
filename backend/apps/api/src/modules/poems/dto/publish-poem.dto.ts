import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PublishPoemDto {
  @ApiPropertyOptional({ default: false, description: 'Mint as NFT on publication' })
  @IsOptional()
  @IsBoolean()
  mintAsNFT?: boolean;
}