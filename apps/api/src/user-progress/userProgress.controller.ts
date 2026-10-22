import { Body, Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UserProgressService } from './userProgress.service';
import type { Auth } from "../auth/auth";
import { ListUserProgressQueryDto } from './dto/list-user-progress-query.dto';
import { UpsertUserProgressDto } from './dto/upsert-user-progress.dto';

@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Get()
  findAll(
    @Session session: UserSession<Auth>,
    @Query(new ValidationPipe({ transform: true })) query: ListUserProgressQueryDto
  ) {
    return this.userProgressService.findAllForUser(session.user.id, query);
  }

  @Post()
  upsert(
    // @ts-expect-error needs looking into
    @Session session: UserSession<Auth>,
    // @ts-expect-error needs looking into
    @Body body: UpsertUserProgressDto
  ) {
    return this.userProgressService.upsert(session.user.id, body);
  }
}
