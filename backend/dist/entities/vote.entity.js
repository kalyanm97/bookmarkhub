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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vote = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bookmark_entity_1 = require("./bookmark.entity");
let Vote = class Vote {
};
exports.Vote = Vote;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], Vote.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'bookmark_id', type: 'uuid' }),
    __metadata("design:type", String)
], Vote.prototype, "bookmarkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint' }),
    __metadata("design:type", Number)
], Vote.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (u) => u.votes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Vote.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bookmark_entity_1.Bookmark, (b) => b.votes, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'bookmark_id' }),
    __metadata("design:type", bookmark_entity_1.Bookmark)
], Vote.prototype, "bookmark", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Vote.prototype, "createdAt", void 0);
exports.Vote = Vote = __decorate([
    (0, typeorm_1.Entity)('votes')
], Vote);
