import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { RolesGuard } from './auth/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from './lib/auth';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule.forRoot({ auth, disableGlobalAuthGuard: true }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
