import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from "./auth/auth";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule.forRoot({ auth })
  ]
})
export class AppModule {}
