import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PoemsModule } from './modules/poems/poems.module';
import { AiModule } from './modules/ai/ai.module';
import { LikesModule } from './modules/likes/likes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

import { AppController } from './app.controller';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RedisHealthService } from './config/redis-health.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('redis.url');
        
        if (!redisUrl) {
          throw new Error('REDIS_URL is required in environment variables');
        }

        console.log('🔌 Configuring Redis with URL:', redisUrl.replace(/\/\/:[^@]*@/, '//***@'));

        return {
          redis: {
            ...(redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://') 
              ? { 
                  host: new URL(redisUrl).hostname,
                  port: parseInt(new URL(redisUrl).port),
                  password: new URL(redisUrl).password,
                  tls: redisUrl.startsWith('rediss://') ? {} : undefined,
                }
              : { 
                  url: redisUrl 
                }
            ),
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            enableReadyCheck: false,
            autoResubscribe: true,
            lazyConnect: true,
            connectTimeout: 30000,
            commandTimeout: 30000,
            retryStrategy(times: number) {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
          },
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            timeout: 30000,
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    PoemsModule,
    AiModule,
    LikesModule,
    CommentsModule,
    BlockchainModule
  ],
  controllers: [AppController],
  providers: [
    RedisHealthService, // Add this line
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}