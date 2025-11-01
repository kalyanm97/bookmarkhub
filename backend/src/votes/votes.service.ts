import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from '../entities/vote.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { VoteRespDTO } from '../shared/dtos';

@Injectable()
export class VotesService {
  private readonly logger = new Logger('VotesService');
  constructor(
    @InjectRepository(Vote) private readonly votesRepo: Repository<Vote>,
    @InjectRepository(Bookmark) private readonly bookmarksRepo: Repository<Bookmark>,
  ) {}

  async vote(userId: string, bookmarkId: string, value: -1 | 0 | 1) {
    if (![ -1, 0, 1 ].includes(value)) throw new BadRequestException('Invalid vote value');
    let b: Bookmark | null = null;
    try {
      b = await this.bookmarksRepo.findOne({ where: { id: bookmarkId } });
    } catch (err) {
      this.logger.error('DB error fetching bookmark: ' + String(err), { bookmarkId, userId });
      throw new InternalServerErrorException('Failed to fetch bookmark');
    }
    if (!b) throw new BadRequestException('Bookmark not found');

    if (value === 0) {
      // delete existing vote (if present)
      await this.votesRepo.delete({ userId, bookmarkId });
    } else {
      // atomic upsert: insert or update value on conflict
      try {
        await this.votesRepo
          .createQueryBuilder()
          .insert()
          .into(Vote)
          .values({ userId, bookmarkId, value })
          .onConflict('("user_id","bookmark_id") DO UPDATE SET value = EXCLUDED.value, created_at = now()')
          .execute();
      } catch (err) {
        this.logger.error('DB error upserting vote: ' + String(err), { bookmarkId, userId, value });
        throw new InternalServerErrorException('Failed to save vote');
      }
    }

  let rawResult: { ups: string; downs: string } | undefined;
    try {
      rawResult = await this.votesRepo
        .createQueryBuilder('v')
        .select("COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0)", 'ups')
        .addSelect("COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0)", 'downs')
    .where('v.bookmark_id = :id', { id: bookmarkId })
        .getRawOne<{ ups: string; downs: string }>();
    } catch (err) {
      this.logger.error('DB error fetching vote counts: ' + String(err), { bookmarkId });
      throw new InternalServerErrorException('Failed to fetch vote counts');
    }

    const ups = Number(rawResult?.ups ?? 0);
    const downs = Number(rawResult?.downs ?? 0);

  const resp: VoteRespDTO = { upCount: ups, downCount: downs, userVote: value };
  return resp;
  }
}