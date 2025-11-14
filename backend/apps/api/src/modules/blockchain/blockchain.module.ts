import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { BlockchainProcessor } from './blockchain.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { PoemsModule } from '../poems/poems.module'; // Import PoemsModule if needed

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => PoemsModule),
    BullModule.registerQueue({
      name: 'blockchain',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [BlockchainService, BlockchainProcessor],
  exports: [BlockchainService],
})
export class BlockchainModule {}