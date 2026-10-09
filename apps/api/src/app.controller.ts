// app.controller.ts example
import { Controller, Get } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { AppService } from './app.service';
import { Roles } from './auth/roles.decorator';
import { SessionDto, toSessionDto } from './dto/session.dto';
import type { auth } from './lib/auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('learner-dashboard')
  @Roles('learner', 'author')
  getStudentDashboardData(): string {
    return this.appService.getHello();
  }

  @Get('author-dashboard')
  @Roles('author')
  getAuthorDashboardData(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  @Roles('learner', 'author')
  getProfile(@Session() session: UserSession<typeof auth>): SessionDto {
    return toSessionDto(session);
  }

  @Get('all-modules')
  @Roles('learner', 'author')
  getAllModules(): string {
    return this.appService.getHello();
  }

  @Get('my-modules')
  @Roles('author')
  getMyModules(): string {
    return this.appService.getHello();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
