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
exports.BookmarksController = void 0;
const common_1 = require("@nestjs/common");
const bookmarks_service_1 = require("./bookmarks.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const create_bookmark_dto_1 = require("./dto/create-bookmark.dto");
let BookmarksController = class BookmarksController {
    constructor(svc) {
        this.svc = svc;
    }
    async feed(req) {
        const uid = req?.user?.id;
        return this.svc.getFeed(uid, 50, 0);
    }
    async create(req, dto) {
        const id = req.user?.id;
        if (!id)
            throw new common_1.UnauthorizedException('Unauthorized');
        return this.svc.create(id, dto);
    }
    async update(req, id, dto) {
        const uid = req.user?.id;
        if (!uid)
            throw new common_1.UnauthorizedException('Unauthorized');
        return this.svc.update(uid, id, dto);
    }
};
exports.BookmarksController = BookmarksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "feed", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_bookmark_dto_1.CreateBookmarkDto]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BookmarksController.prototype, "update", null);
exports.BookmarksController = BookmarksController = __decorate([
    (0, common_1.Controller)('bookmarks'),
    __metadata("design:paramtypes", [bookmarks_service_1.BookmarksService])
], BookmarksController);
