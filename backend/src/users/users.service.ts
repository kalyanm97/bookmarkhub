import { ConflictException, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async updateMe(id: string, dto: UpdateUserDto) {
    this.logger.log('updateMe called', { id, dto });
    try {
      const existing = await this.findById(id);
      if (!existing) throw new ConflictException('User not found');

      if (dto.username) {
        const exists = await this.repo.findOne({ where: { username: ILike(dto.username) } });
        if (exists && exists.id !== id) throw new ConflictException('Username already taken');
      }

      // Merge and save to ensure proper persistence and hooks
      const toSave = { ...existing, ...dto } as User;
      const saved = await this.repo.save(toSave);
      this.logger.log('updateMe saved user', { id: saved.id, username: saved.username });
      return this.findById(id);
    } catch (err) {
  this.logger.error('updateMe failed: ' + String(err), { id, dto });
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }
}