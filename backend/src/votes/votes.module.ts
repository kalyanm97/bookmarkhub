import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from '../entities/vote.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { User } from '../entities/user.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { AuthModule } from '../auth/auth.module'; // ✅

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Bookmark, User]), AuthModule],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule { /* module wiring (Nest) */ }