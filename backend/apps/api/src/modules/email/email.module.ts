import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { PoemsModule } from '../poems/poems.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailService } from './email.service';


@Module({
  imports: [PrismaModule, UsersModule, PoemsModule, NotificationsModule, ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailModule],
})
export class EmailModule {}