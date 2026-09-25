// app.controller.ts example
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Session, Roles } from '@thallesp/nestjs-better-auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('learner-dashboard')
  @Roles(['learner', 'author'])
  getStudentDashboardData() {
    return this.appService.getHello();
  }

  @Get('author-dashboard')
  @Roles(['author'])
  getAuthorDashboardData() {
    return this.appService.getHello();
  }

  @Get('profile')
  getProfile(@Session() session: any) {
    return session;
  }
  
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}   