import { Module } from '@nestjs/common';
import { PoemsService } from './poems.service';
import { PoemsController } from './poems.controller';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [UsersModule, AiModule],
  controllers: [PoemsController],
  providers: [PoemsService],
  exports: [PoemsService],
})
export class PoemsModule {}