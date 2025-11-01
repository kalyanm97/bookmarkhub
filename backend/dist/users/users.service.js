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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let UsersService = class UsersService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger('UsersService');
    }
    findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async updateMe(id, dto) {
        this.logger.log('updateMe called', { id, dto });
        try {
            const existing = await this.findById(id);
            if (!existing)
                throw new common_1.ConflictException('User not found');
            if (dto.username) {
                const exists = await this.repo.findOne({ where: { username: (0, typeorm_2.ILike)(dto.username) } });
                if (exists && exists.id !== id)
                    throw new common_1.ConflictException('Username already taken');
            }
            const toSave = { ...existing, ...dto };
            const saved = await this.repo.save(toSave);
            this.logger.log('updateMe saved user', { id: saved.id, username: saved.username });
            return this.findById(id);
        }
        catch (err) {
            this.logger.error('updateMe failed: ' + String(err), { id, dto });
            if (err instanceof common_1.ConflictException)
                throw err;
            throw new common_1.InternalServerErrorException('Failed to update user');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
