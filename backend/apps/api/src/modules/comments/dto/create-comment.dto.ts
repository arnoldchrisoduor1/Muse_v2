// modules/comments/dto/create-comment.dto.ts
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'Parent comment ID for replies',
    required: false 
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}