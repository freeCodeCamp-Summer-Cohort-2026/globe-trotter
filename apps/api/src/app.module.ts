import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { TutorialsModule } from './tutorials/tutorials.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DatabaseModule, HealthModule, AuthModule, TutorialsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
