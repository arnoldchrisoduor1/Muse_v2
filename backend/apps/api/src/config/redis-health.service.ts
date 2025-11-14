// src/config/redis-health.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthService implements OnModuleInit {
  private readonly logger = new Logger(RedisHealthService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = this.configService.get('redis.url');
    
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not configured - Redis functionality will be limited');
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 10000,
        retryStrategy(times: number) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.redis.on('connect', () => {
        this.logger.log('✅ Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.error('❌ Redis connection error:', error.message);
      });

      this.redis.on('close', () => {
        this.logger.warn('🔌 Redis connection closed');
      });

      // Test connection
      await this.redis.ping();
      this.logger.log('✅ Redis ping successful');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis:', error.message);
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!this.redis) {
      this.logger.warn('Redis client not initialized');
      return false;
    }

    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error.message);
      return false;
    }
  }

  async getRedisInfo(): Promise<any> {
    if (!this.redis) {
      return { 
        connected: false,
        error: 'Redis client not initialized'
      };
    }

    try {
      // Get basic Redis info
      const info = await this.redis.info();
      const infoLines = info.split('\r\n');
      const simplifiedInfo: any = { connected: true };

      // Extract key metrics
      const relevantKeys = [
        'redis_version',
        'used_memory_human',
        'connected_clients',
        'used_memory_peak_human',
        'used_memory_lua_human',
        'used_cpu_sys',
        'used_cpu_user'
      ];

      relevantKeys.forEach(key => {
        const line = infoLines.find(l => l.startsWith(`${key}:`));
        if (line) {
          simplifiedInfo[key] = line.split(':')[1];
        }
      });

      return simplifiedInfo;
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  async testRedisOperations(): Promise<any> {
    if (!this.redis) {
      return { success: false, error: 'Redis not available' };
    }

    try {
      const testKey = 'health-test';
      const testValue = `test-${Date.now()}`;
      
      // Test write
      await this.redis.set(testKey, testValue, 'EX', 10); // 10 second expiry
      
      // Test read
      const retrievedValue = await this.redis.get(testKey);
      
      // Test delete
      await this.redis.del(testKey);

      return {
        success: true,
        write: retrievedValue === testValue ? 'success' : 'failed',
        read: retrievedValue === testValue ? 'success' : 'failed',
        delete: 'success'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}