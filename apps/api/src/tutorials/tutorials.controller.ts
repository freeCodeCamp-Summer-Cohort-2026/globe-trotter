import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import type { TutorialDetail } from '@repo/types';
import { TutorialsService } from './tutorials.service';

@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get(':id')
  @AllowAnonymous()
  @Roles(['learner', 'author'])
  getTutorial(@Param('id', new ParseUUIDPipe()) id: string): Promise<TutorialDetail> {
    return this.tutorialsService.getTutorial(id);
  }
}
