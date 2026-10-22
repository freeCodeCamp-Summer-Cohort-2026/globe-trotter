import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { LabsModule } from './labs/labs.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DatabaseModule, HealthModule, AuthModule, LabsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
