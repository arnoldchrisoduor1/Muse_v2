import { Module } from '@nestjs/common';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { PoemsModule } from '../poems/poems.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { NotificationService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Module({
  imports: [PrismaModule, UsersModule, PoemsModule, NotificationsModule, EmailModule],
  controllers: [CollaborationController],
  providers: [CollaborationService, NotificationService, EmailService],
  exports: [CollaborationService],
})
export class CollaborationModule {}