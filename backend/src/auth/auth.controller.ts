import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { user, token } = await this.auth.register(dto);
    // http-only cookie with JWT
    res.setCookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { user };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
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

  @Post('logout')
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    res.clearCookie('access_token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
    });
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async me(@Req() req: FastifyRequest & { user?: { id?: string; sub?: string } }) {
    const id = req.user?.sub ?? req.user?.id;
    const u = await this.usersRepo.findOne({ where: { id } });
    if (!u) return null;

    return {
      id: u.id,
      email: u.email,
      displayName: u.displayName ?? null,
      username: u.username ?? null,
    };
  }
}