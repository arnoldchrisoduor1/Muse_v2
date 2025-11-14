import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PoemsService } from './poems.service';
import { PoemsController } from './poems.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AiModule,
    forwardRef(() => BlockchainModule),
    BullModule.registerQueue({
      name: 'blockchain',
    }),
  ],
  controllers: [PoemsController],
  providers: [PoemsService],
  exports: [PoemsService],
})
export class PoemsModule {}