import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { Vote } from '../entities/vote.entity';
import { User } from '../entities/user.entity';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Vote, User]), AuthModule],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule { /* module wiring (Nest) */ }