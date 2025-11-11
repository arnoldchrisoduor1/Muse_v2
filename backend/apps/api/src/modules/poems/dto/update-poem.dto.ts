import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePoemDto } from './create-poem.dto';

export class UpdatePoemDto extends PartialType(
  OmitType(CreatePoemDto, ['isAnonymous', 'publishNow'] as const),
) {}