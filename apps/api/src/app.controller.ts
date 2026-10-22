// app.controller.ts example
import { Controller, Get } from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';
import { type SessionDto, toSessionDto } from './dto/session.dto';

// Compile-time-only import (i.e. doesn't pull factory into controller's runtime dependency graph)
import type { Auth } from './auth/auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('learner-dashboard')
  @Roles(['learner', 'author'])
  getStudentDashboardData(): string {
    return this.appService.getHello();
  }

  @Get('author-dashboard')
  @Roles(['author'])
  getAuthorDashboardData(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  @Roles(['learner', 'author'])
  getProfile(@Session() session: UserSession<Auth>): SessionDto {
    return toSessionDto(session);
  }

  @Get('all-modules')
  @Roles(['learner', 'author'])
  getAllModules(): string {
    return this.appService.getHello();
  }

  @Get('my-modules')
  @Roles(['author'])
  getMyModules(): string {
    return this.appService.getHello();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
