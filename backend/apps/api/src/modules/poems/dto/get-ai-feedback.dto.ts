import { IsString, IsNotEmpty } from 'class-validator';

export class GetAIFeedbackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}