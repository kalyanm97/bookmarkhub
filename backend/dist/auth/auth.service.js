"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../entities/user.entity");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(users, jwt, usersService) {
        this.users = users;
        this.jwt = jwt;
        this.usersService = usersService;
    }
    async register(dto) {
        const exEmail = await this.users.findOne({ where: { email: dto.email } });
        if (exEmail)
            throw new common_1.ConflictException('Email already exists');
        const exUsername = await this.users.findOne({ where: { username: (0, typeorm_2.ILike)(dto.username) } });
        if (exUsername)
            throw new common_1.ConflictException('Username already exists');
        const u = this.users.create({
            email: dto.email,
            passwordHash: await bcrypt.hash(dto.password, 12),
            displayName: null,
            username: dto.username,
        });
        await this.users.save(u);
        const token = await this.jwt.signAsync({ sub: u.id, email: u.email, username: u.username }, { secret: process.env.JWT_SECRET, expiresIn: '7d' });
        const safeUser = {
            id: u.id ?? '',
            email: u.email ?? null,
            username: u.username ?? null,
            displayName: u.displayName ?? null,
        };
        return { user: safeUser, token };
    }
    async login(dto) {
        const u = await this.users.findOne({
            where: [{ email: dto.identifier }, { username: (0, typeorm_2.ILike)(dto.identifier) }],
        });
        if (!u || !u.passwordHash || !(await bcrypt.compare(dto.password, u.passwordHash)))
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = await this.jwt.signAsync({ sub: u.id, email: u.email, username: u.username }, { secret: process.env.JWT_SECRET, expiresIn: '7d' });
        const safeUser2 = {
            id: u.id ?? '',
            email: u.email ?? null,
            username: u.username ?? null,
            displayName: u.displayName ?? null,
        };
        return { user: safeUser2, token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => users_service_1.UsersService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        users_service_1.UsersService])
], AuthService);
