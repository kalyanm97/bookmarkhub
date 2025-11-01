import { Injectable, NotFoundException, ForbiddenException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '../entities/bookmark.entity';
import { Vote } from '../entities/vote.entity';
import { User } from '../entities/user.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { BookmarkDTO } from '../shared/dtos';

@Injectable()
export class BookmarksService {
  private readonly logger = new Logger('BookmarksService');

  constructor(
    @InjectRepository(Bookmark) private readonly bookmarksRepo: Repository<Bookmark>,
    @InjectRepository(Vote) private readonly votesRepo: Repository<Vote>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  // Existing feed query (newest first)
  async getFeed(currentUserId?: string, take = 50, skip = 0): Promise<BookmarkDTO[]> {
    // single aggregated query: upCount, downCount and userVote (if currentUserId provided)
    const qb = this.bookmarksRepo
      .createQueryBuilder('b')
      .leftJoin('b.user', 'u')
      .leftJoin('b.votes', 'v')
      .addSelect(['u.id', 'u.email', 'u.displayName', 'u.username'])
      .addSelect("COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0)", 'up_count')
      .addSelect("COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0)", 'down_count')
      // user_vote: if currentUserId provided, compute MAX CASE WHEN v.user_id = :uid THEN v.value ELSE 0 END, else 0
      .addSelect(currentUserId ? "COALESCE(MAX(CASE WHEN v.user_id = :uid THEN v.value ELSE 0 END), 0)" : '0', 'user_vote')
      .groupBy('b.id')
      .addGroupBy('u.id')
      .orderBy('b.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    if (currentUserId) qb.setParameter('uid', currentUserId);

    const rows = await qb.getRawAndEntities();
    const items: BookmarkDTO[] = rows.entities.map((e, i) => {
      const raw = rows.raw[i] ?? {};
        const postedBy = e.user
          ? { id: e.user.id, email: e.user.email ?? null, displayName: (e.user as Partial<{ displayName?: string }>).displayName ?? null, username: (e.user as Partial<{ username?: string }>).username ?? null }
          : null;
      return {
        id: e.id,
        title: e.title,
        url: e.url,
        createdAt: e.createdAt.toISOString(),
        postedBy,
        upCount: Number(raw.up_count ?? 0),
        downCount: Number(raw.down_count ?? 0),
        userVote: Number(raw.user_vote ?? 0) as -1 | 0 | 1,
      };
    });

    return items;
  }

  // Fetch one bookmark in feed-item shape
  async getFeedItemById(id: string, currentUserId?: string): Promise<BookmarkDTO | null> {
    const qb = this.bookmarksRepo
      .createQueryBuilder('b')
      .leftJoin('b.user', 'u')
      .leftJoin('b.votes', 'v')
      .addSelect(['u.id', 'u.email', 'u.displayName', 'u.username'])
      .addSelect("COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0)", 'up_count')
      .addSelect("COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0)", 'down_count')
      .addSelect(currentUserId ? "COALESCE(MAX(CASE WHEN v.user_id = :uid THEN v.value ELSE 0 END), 0)" : '0', 'user_vote')
      .where('b.id = :id', { id })
      .groupBy('b.id')
      .addGroupBy('u.id');

    if (currentUserId) qb.setParameter('uid', currentUserId);

    const { raw, entities } = await qb.getRawAndEntities();
    if (!entities[0]) return null;

    const e = entities[0];
    const r = (raw[0] ?? {}) as Record<string, unknown>;
  const postedBy = e.user ? { id: e.user.id, email: e.user.email ?? null, displayName: (e.user as Partial<{ displayName?: string }>).displayName ?? null, username: (e.user as Partial<{ username?: string }>).username ?? null } : null;
    const item: BookmarkDTO = {
      id: e.id,
      title: e.title,
      url: e.url,
      createdAt: e.createdAt.toISOString(),
      postedBy,
      upCount: Number((r['up_count'] ?? 0)),
      downCount: Number((r['down_count'] ?? 0)),
      userVote: Number((r['user_vote'] ?? 0)) as -1 | 0 | 1,
    };
    return item;
  }

  async create(userId: string, dto: CreateBookmarkDto): Promise<BookmarkDTO | null> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    const b = this.bookmarksRepo.create({ title: dto.title, url: dto.url, user });
    const saved = await this.bookmarksRepo.save(b);
    return this.getFeedItemById(saved.id, userId);
  }

  async update(userId: string, id: string, dto: Partial<{ title?: string; url?: string }>): Promise<BookmarkDTO> {
  this.logger.log('update attempt', { userId, id, dto });

    let b: Bookmark | null = null;
    try {
      b = await this.bookmarksRepo.findOne({ where: { id } });
    } catch (err) {
  this.logger.error('DB error while finding bookmark: ' + String(err), { id, userId });
      throw new InternalServerErrorException('Failed to fetch bookmark');
    }
  if (!b) {
      this.logger.warn('bookmark not found', { id, userId });
      throw new NotFoundException('Bookmark not found');
    }
    // only owner can update
    if (!b.user || b.user.id !== userId) {
      this.logger.warn('forbidden update attempt', { id, userId, ownerId: b.user?.id });
      throw new ForbiddenException('Not allowed to update this bookmark');
    }
    if (dto.title) b.title = dto.title;
    if (dto.url) b.url = dto.url;
  await this.bookmarksRepo.save(b);
  const item = await this.getFeedItemById(b.id, userId);
  if (!item) throw new InternalServerErrorException('Failed to load updated bookmark');
  return item;
  }
}