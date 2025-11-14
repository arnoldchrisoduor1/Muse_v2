import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './modules/auth/decorators/public.decorator';
import { PrismaService } from './prisma/prisma.service';
import { RedisHealthService } from './config/redis-health.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private redisHealthService: RedisHealthService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API root - health check' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getRoot() {
    return {
      name: 'Collective Poetry API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/docs',
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async healthCheck() {
    // Check database connection
    let dbStatus = 'healthy';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'unhealthy';
    }

    // Check Redis connection
    let redisStatus = 'healthy';
    let redisInfo: any = null;
    try {
      const isRedisHealthy = await this.redisHealthService.checkHealth();
      redisStatus = isRedisHealthy ? 'healthy' : 'unhealthy';
      redisInfo = await this.redisHealthService.getRedisInfo();
    } catch (error) {
      redisStatus = 'unhealthy';
      redisInfo = { error: error?.message };
    }

    // Determine overall health
    const overallStatus = dbStatus === 'healthy' && redisStatus === 'healthy' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      redis: redisInfo,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  }

  @Public()
  @Get('health/redis')
  @ApiOperation({ summary: 'Redis-specific health check' })
  @ApiResponse({ status: 200, description: 'Redis is healthy' })
  @ApiResponse({ status: 503, description: 'Redis is unhealthy' })
  async redisHealthCheck() {
    try {
      const isHealthy = await this.redisHealthService.checkHealth();
      const redisInfo = await this.redisHealthService.getRedisInfo();

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        redis: redisInfo,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Public()
  @Get('health/database')
  @ApiOperation({ summary: 'Database-specific health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unhealthy' })
  async databaseHealthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Get some basic stats
      const poemCount = await this.prisma.poem.count();
      const userCount = await this.prisma.user.count();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats: {
          poems: poemCount,
          users: userCount,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}