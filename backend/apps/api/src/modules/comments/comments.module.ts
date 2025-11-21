import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommentVotesController } from './comment-votes.controller';
import { CommentVotesService } from './comment-votes.service';

@Module({
  imports: [PrismaModule],
  controllers: [CommentsController, CommentVotesController],
  providers: [CommentsService, CommentVotesService],
  exports: [CommentsService],
})
export class CommentsModule {}