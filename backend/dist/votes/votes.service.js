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
exports.VotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vote_entity_1 = require("../entities/vote.entity");
const bookmark_entity_1 = require("../entities/bookmark.entity");
let VotesService = class VotesService {
    constructor(votesRepo, bookmarksRepo) {
        this.votesRepo = votesRepo;
        this.bookmarksRepo = bookmarksRepo;
        this.logger = new common_1.Logger('VotesService');
    }
    async vote(userId, bookmarkId, value) {
        if (![-1, 0, 1].includes(value))
            throw new common_1.BadRequestException('Invalid vote value');
        let b = null;
        try {
            b = await this.bookmarksRepo.findOne({ where: { id: bookmarkId } });
        }
        catch (err) {
            this.logger.error('DB error fetching bookmark: ' + String(err), { bookmarkId, userId });
            throw new common_1.InternalServerErrorException('Failed to fetch bookmark');
        }
        if (!b)
            throw new common_1.BadRequestException('Bookmark not found');
        if (value === 0) {
            await this.votesRepo.delete({ userId, bookmarkId });
        }
        else {
            try {
                await this.votesRepo
                    .createQueryBuilder()
                    .insert()
                    .into(vote_entity_1.Vote)
                    .values({ userId, bookmarkId, value })
                    .onConflict('("user_id","bookmark_id") DO UPDATE SET value = EXCLUDED.value, created_at = now()')
                    .execute();
            }
            catch (err) {
                this.logger.error('DB error upserting vote: ' + String(err), { bookmarkId, userId, value });
                throw new common_1.InternalServerErrorException('Failed to save vote');
            }
        }
        let rawResult;
        try {
            rawResult = await this.votesRepo
                .createQueryBuilder('v')
                .select("COALESCE(SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END), 0)", 'ups')
                .addSelect("COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0)", 'downs')
                .where('v.bookmark_id = :id', { id: bookmarkId })
                .getRawOne();
        }
        catch (err) {
            this.logger.error('DB error fetching vote counts: ' + String(err), { bookmarkId });
            throw new common_1.InternalServerErrorException('Failed to fetch vote counts');
        }
        const ups = Number(rawResult?.ups ?? 0);
        const downs = Number(rawResult?.downs ?? 0);
        const resp = { upCount: ups, downCount: downs, userVote: value };
        return resp;
    }
};
exports.VotesService = VotesService;
exports.VotesService = VotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vote_entity_1.Vote)),
    __param(1, (0, typeorm_1.InjectRepository)(bookmark_entity_1.Bookmark)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VotesService);
