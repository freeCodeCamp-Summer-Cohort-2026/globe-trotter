import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import type { LabDetail, LabSubmissionResult } from '@repo/types';
// Compile-time-only import, so the auth factory is not pulled into the controller's runtime dependency graph.
import type { Auth } from '../auth/auth';
import { SubmitLabDto } from './dto/submit-lab.dto';
import { LabsService } from './labs.service';

@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Get(':id')
  @Roles(['learner', 'author'])
  getLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<LabDetail> {
    return this.labsService.getLab(id);
  }

  // Evaluating a submission does not create a resource, so it responds with 200 rather than 201.
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(['learner', 'author'])
  submitLab(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Session() session: UserSession<Auth>,
    @Body(new ValidationPipe({ whitelist: true })) submission: SubmitLabDto,
  ): Promise<LabSubmissionResult> {
    return this.labsService.submitLab(id, session.user.id, submission.answers);
  }
}
