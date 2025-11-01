import { ConflictException, Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const exEmail = await this.users.findOne({ where: { email: dto.email } });
    if (exEmail) throw new ConflictException('Email already exists');

    const exUsername = await this.users.findOne({ where: { username: ILike(dto.username) } });
    if (exUsername) throw new ConflictException('Username already exists');

    const u = this.users.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 12),
      displayName: null,
      username: dto.username,
    });
    await this.users.save(u);

    const token = await this.jwt.signAsync(
      { sub: u.id, email: u.email, username: u.username },
      { secret: process.env.JWT_SECRET, expiresIn: '7d' },
    );

    const safeUser = {
      id: u.id ?? '',
      email: u.email ?? null,
      username: u.username ?? null,
      displayName: u.displayName ?? null,
    };
    return { user: safeUser, token };
  }

  async login(dto: LoginDto) {
    const u = await this.users.findOne({
      where: [{ email: dto.identifier }, { username: ILike(dto.identifier) }],
    });
    if (!u || !u.passwordHash || !(await bcrypt.compare(dto.password, u.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync(
      { sub: u.id, email: u.email, username: u.username },
      { secret: process.env.JWT_SECRET, expiresIn: '7d' },
    );

    const safeUser2 = {
      id: u.id ?? '',
      email: u.email ?? null,
      username: u.username ?? null,
      displayName: u.displayName ?? null,
    };
    return { user: safeUser2, token };
  }
}