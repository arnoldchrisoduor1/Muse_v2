import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedPoemId?: string;
    relatedUserId?: string;
    metadata?: any;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        relatedPoemId: data.relatedPoemId,
        relatedUserId: data.relatedUserId,
        metadata: data.metadata,
      },
    });
  }
}