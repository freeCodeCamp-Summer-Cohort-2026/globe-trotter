import type { LabAnswer, LabSubmission } from '@repo/types';
import { IsObject, ValidateBy, isObject } from 'class-validator';
import { isLabAnswer } from '../lab-evaluation';

// Checks the shape of every answer. Whether a shape suits the goal it answers is checked by LabsService, which knows the goal types.
function IsLabAnswers(): PropertyDecorator {
  return ValidateBy({
    name: 'isLabAnswers',
    validator: {
      // Non-objects are reported by @IsObject().
      validate: (answers: unknown) =>
        !isObject(answers) || Object.values(answers).every(isLabAnswer),
      defaultMessage: () =>
        'each answer must be a string, a number, a list of [longitude, latitude] positions, or a list containing one ring of [longitude, latitude] positions',
    },
  });
}

export class SubmitLabDto implements LabSubmission {
  // Keyed by goal ID.
  @IsObject()
  @IsLabAnswers()
  answers!: Record<string, LabAnswer>;
}
