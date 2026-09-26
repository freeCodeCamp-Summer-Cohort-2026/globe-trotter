import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './lib/auth';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule.forRoot({ auth: createAuth() }),
  ],
})
export class AppModule {}
