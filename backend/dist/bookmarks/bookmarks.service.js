"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bookmark_entity_1 = require("../entities/bookmark.entity");
const vote_entity_1 = require("../entities/vote.entity");
const user_entity_1 = require("../entities/user.entity");
let BookmarksService = class BookmarksService {
    constructor(bookmarksRepo, votesRepo, usersRepo) {
        this.bookmarksRepo = bookmarksRepo;
        this.votesRepo = votesRepo;
        this.usersRepo = usersRepo;
        this.logger = new common_1.Logger('BookmarksService');
    }
    async getFeed(currentUserId, take = 50, skip = 0) {
        const qb = this.bookmarksRepo
            .createQueryBuilder('b')
            .leftJoin('b.user', 'u')
            .leftJoin('b.votes', 'v')
            .addSelect(['u.id', 'u.email', 'u.displayName', 'u.username'])
            .addSelect("COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0)", 'up_count')
            .addSelect("COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0)", 'down_count')
            .addSelect(currentUserId ? "COALESCE(MAX(CASE WHEN v.user_id = :uid THEN v.value ELSE 0 END), 0)" : '0', 'user_vote')
            .groupBy('b.id')
            .addGroupBy('u.id')
            .orderBy('b.createdAt', 'DESC')
            .take(take)
            .skip(skip);
        if (currentUserId)
            qb.setParameter('uid', currentUserId);
        const rows = await qb.getRawAndEntities();
        const items = rows.entities.map((e, i) => {
            const raw = rows.raw[i] ?? {};
            const postedBy = e.user
                ? { id: e.user.id, email: e.user.email ?? null, displayName: e.user.displayName ?? null, username: e.user.username ?? null }
                : null;
            return {
                id: e.id,
                title: e.title,
                url: e.url,
                createdAt: e.createdAt.toISOString(),
                postedBy,
                upCount: Number(raw.up_count ?? 0),
                downCount: Number(raw.down_count ?? 0),
                userVote: Number(raw.user_vote ?? 0),
            };
        });
        return items;
    }
    async getFeedItemById(id, currentUserId) {
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
        if (currentUserId)
            qb.setParameter('uid', currentUserId);
        const { raw, entities } = await qb.getRawAndEntities();
        if (!entities[0])
            return null;
        const e = entities[0];
        const r = (raw[0] ?? {});
        const postedBy = e.user ? { id: e.user.id, email: e.user.email ?? null, displayName: e.user.displayName ?? null, username: e.user.username ?? null } : null;
        const item = {
            id: e.id,
            title: e.title,
            url: e.url,
            createdAt: e.createdAt.toISOString(),
            postedBy,
            upCount: Number((r['up_count'] ?? 0)),
            downCount: Number((r['down_count'] ?? 0)),
            userVote: Number((r['user_vote'] ?? 0)),
        };
        return item;
    }
    async create(userId, dto) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        const b = this.bookmarksRepo.create({ title: dto.title, url: dto.url, user });
        const saved = await this.bookmarksRepo.save(b);
        return this.getFeedItemById(saved.id, userId);
    }
    async update(userId, id, dto) {
        this.logger.log('update attempt', { userId, id, dto });
        let b = null;
        try {
            b = await this.bookmarksRepo.findOne({ where: { id } });
        }
        catch (err) {
            this.logger.error('DB error while finding bookmark: ' + String(err), { id, userId });
            throw new common_1.InternalServerErrorException('Failed to fetch bookmark');
        }
        if (!b) {
            this.logger.warn('bookmark not found', { id, userId });
            throw new common_1.NotFoundException('Bookmark not found');
        }
        if (!b.user || b.user.id !== userId) {
            this.logger.warn('forbidden update attempt', { id, userId, ownerId: b.user?.id });
            throw new common_1.ForbiddenException('Not allowed to update this bookmark');
        }
        if (dto.title)
            b.title = dto.title;
        if (dto.url)
            b.url = dto.url;
        await this.bookmarksRepo.save(b);
        const item = await this.getFeedItemById(b.id, userId);
        if (!item)
            throw new common_1.InternalServerErrorException('Failed to load updated bookmark');
        return item;
    }
};
exports.BookmarksService = BookmarksService;
exports.BookmarksService = BookmarksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bookmark_entity_1.Bookmark)),
    __param(1, (0, typeorm_1.InjectRepository)(vote_entity_1.Vote)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BookmarksService);
