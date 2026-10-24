import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LabsModule } from './labs/labs.module';
import { TutorialsModule } from './tutorials/tutorials.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserProgressModule } from './user-progress/userProgress.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    LabsModule,
    TutorialsModule,
    UserProgressModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
