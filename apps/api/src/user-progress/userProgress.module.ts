import { Module } from '@nestjs/common';
import { UserProgressController } from './userProgress.controller';
import { UserProgressService } from './userProgress.service';

@Module({
  controllers: [UserProgressController],
  providers: [UserProgressService],
})
export class UserProgressModule {}
