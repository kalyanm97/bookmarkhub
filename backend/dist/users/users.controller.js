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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const update_user_dto_1 = require("./dto/update-user.dto");
let UsersController = class UsersController {
    constructor(users) {
        this.users = users;
        this.logger = new common_1.Logger('UsersController');
    }
    me(req) {
        const id = req.user?.id ?? req.user?.sub;
        if (!id) {
            this.logger.warn('me: missing user id in request');
            throw new common_1.InternalServerErrorException('Missing user id');
        }
        return this.users.findById(id).then((u) => {
            if (!u)
                return null;
            return {
                id: u.id,
                email: u.email,
                displayName: u.displayName ?? null,
                username: u.username ?? null,
            };
        });
    }
    updateMe(req, dto) {
        const id = req.user?.id ?? req.user?.sub;
        this.logger.log('updateMe called', { id, dto });
        if (!id) {
            this.logger.warn('updateMe: missing user id in request');
            throw new common_1.InternalServerErrorException('Missing user id');
        }
        return this.users.updateMe(id, dto).then((u) => {
            if (!u)
                return null;
            this.logger.log('updateMe saved', { id: u.id, username: u.username });
            return {
                id: u.id,
                email: u.email,
                displayName: u.displayName ?? null,
                username: u.username ?? null,
            };
        }).catch((err) => {
            this.logger.error('updateMe failed: ' + String(err), { id, dto });
            throw new common_1.InternalServerErrorException('Failed to update user');
        });
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "me", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
