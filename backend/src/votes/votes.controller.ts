import { Body, Controller, Param, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VotesService } from './votes.service';
import { VoteRespDTO } from '../shared/dtos';

@UseGuards(JwtAuthGuard)
@Controller('votes')
export class VotesController {
  constructor(private readonly svc: VotesService) {}

  @Post('bookmark/:id')
  vote(@Req() req: FastifyRequest & { user?: { id?: string; sub?: string } }, @Param('id') bookmarkId: string, @Body() body: { value: -1 | 0 | 1 }): Promise<VoteRespDTO> {
    const uid = req.user?.id ?? req.user?.sub;
    if (!uid) throw new UnauthorizedException('Missing user id');
    return this.svc.vote(uid, bookmarkId, body?.value ?? 0) as Promise<VoteRespDTO>;
  }
}