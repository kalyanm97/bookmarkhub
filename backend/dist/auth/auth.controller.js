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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let AuthController = class AuthController {
    constructor(auth, usersRepo) {
        this.auth = auth;
        this.usersRepo = usersRepo;
    }
    async register(dto, res) {
        const { user, token } = await this.auth.register(dto);
        res.setCookie('access_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.COOKIE_SECURE === 'true',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return { user };
    }
    async login(dto, res) {
        const { user, token } = await this.auth.login(dto);
        res.setCookie('access_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.COOKIE_SECURE === 'true',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return { user };
    }
    async logout(res) {
        res.clearCookie('access_token', {
            path: '/',
            sameSite: 'lax',
            secure: process.env.COOKIE_SECURE === 'true',
        });
        return;
    }
    async me(req) {
        const id = req.user?.sub ?? req.user?.id;
        const u = await this.usersRepo.findOne({ where: { id } });
        if (!u)
            return null;
        return {
            id: u.id,
            email: u.email,
            displayName: u.displayName ?? null,
            username: u.username ?? null,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        typeorm_2.Repository])
], AuthController);
