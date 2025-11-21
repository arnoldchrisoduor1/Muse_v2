// modules/bookmarks/bookmarks.module.ts
import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController, UserBookmarksController } from './bookmarks.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookmarksController, UserBookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class BookmarksModule {}