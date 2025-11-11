import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Collective Poetry API')
    .setDescription(
      'Backend API for Collective Poetry platform - combining creative writing, blockchain, and LLMs',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('poems', 'Poem CRUD and AI feedback')
    .addTag('likes', 'Poem engagement - likes')
    .addTag('comments', 'Poem engagement - comments')
    .addTag('health', 'System health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`
  🚀 Application is running!
  
  📍 API: http://localhost:${port}/api/v1
  📚 Docs: http://localhost:${port}/api/docs
  ✅ Health: http://localhost:${port}/health
  
  📊 Available modules:
  - Auth (register, login, JWT)
  - Users (profiles, follow system)
  - Poems (CRUD, AI feedback)
  - Likes & Comments (engagement)
  
  🤖 AI: EleutherAI/gpt-j-6B 3.2 via HuggingFace
  💾 Database: Neon PostgreSQL with pgvector
  🔐 Auth: JWT with refresh tokens
  `);
}

bootstrap();