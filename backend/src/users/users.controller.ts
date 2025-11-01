import { Controller, Get, Put, Body, UseGuards, Req, Logger, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FastifyRequest } from 'fastify';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger('UsersController');
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: FastifyRequest & { user?: { id?: string; sub?: string } }) {
      const id = req.user?.id ?? req.user?.sub;
      if (!id) {
        this.logger.warn('me: missing user id in request');
        throw new InternalServerErrorException('Missing user id');
      }
    return this.users.findById(id).then((u) => {
      if (!u) return null;
      return {
        id: u.id,
        email: u.email,
        displayName: u.displayName ?? null,
        username: u.username ?? null,
      };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateMe(@Req() req: FastifyRequest & { user?: { id?: string; sub?: string } }, @Body() dto: UpdateUserDto) {
  const id = req.user?.id ?? req.user?.sub;
  // Log incoming DTO
    this.logger.log('updateMe called', { id, dto });
    if (!id) {
      this.logger.warn('updateMe: missing user id in request');
      throw new InternalServerErrorException('Missing user id');
    }
  return this.users.updateMe(id, dto).then((u) => {
      if (!u) return null;
      this.logger.log('updateMe saved', { id: u.id, username: u.username });
  return {
        id: u.id,
        email: u.email,
        displayName: u.displayName ?? null,
        username: u.username ?? null,
      };
    }).catch((err) => {
  this.logger.error('updateMe failed: ' + String(err), { id, dto });
      throw new InternalServerErrorException('Failed to update user');
    });
  }
}