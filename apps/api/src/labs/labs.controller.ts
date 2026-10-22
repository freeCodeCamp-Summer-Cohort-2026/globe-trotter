import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth';
import type { LabDetail } from '@repo/types';
import { LabsService } from './labs.service';

@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Get(':id')
  @AllowAnonymous()
  @Roles(['learner', 'author'])
  getLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabDetail> {
    return this.labsService.getLab(id);
  }
}
