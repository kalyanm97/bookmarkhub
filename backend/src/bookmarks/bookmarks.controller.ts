import { Body, Controller, Get, Post, Put, Req, UseGuards, Param, UnauthorizedException } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { BookmarkDTO } from '../shared/dtos';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly svc: BookmarksService) {}

  @Get() // PUBLIC
  async feed(@Req() req: { user?: { id?: string } }): Promise<BookmarkDTO[]> {
    const uid: string | undefined = req?.user?.id;
    return this.svc.getFeed(uid, 50, 0);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: { user?: { id?: string } }, @Body() dto: CreateBookmarkDto): Promise<BookmarkDTO | null> {
    const id = req.user?.id;
    if (!id) throw new UnauthorizedException('Unauthorized');
    return this.svc.create(id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: { user?: { id?: string } }, @Param('id') id: string, @Body() dto: Partial<{ title?: string; url?: string }>): Promise<BookmarkDTO> {
    const uid = req.user?.id;
    if (!uid) throw new UnauthorizedException('Unauthorized');
    return this.svc.update(uid, id, dto);
  }
}