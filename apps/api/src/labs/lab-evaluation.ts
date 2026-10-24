import type { LabAnswer, LabGoal, LabGoalResult } from '@repo/types';
import { closeRing, isSamePosition, isWithinTolerance } from '../lib/geo';

type Position = [number, number];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// A [longitude, latitude] pair with a valid latitude.
export function isPosition(value: unknown): value is Position {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }

  const [longitude, latitude]: unknown[] = value;

  return (
    isFiniteNumber(longitude) &&
    isFiniteNumber(latitude) &&
    Math.abs(latitude) <= 90
  );
}

export function isPositionList(value: unknown): value is Position[] {
  return Array.isArray(value) && value.every(isPosition);
}

// Checks that a value has one of the accepted answer shapes, regardless of which goal it answers.
export function isLabAnswer(value: unknown): value is LabAnswer {
  return (
    typeof value === 'string' ||
    isFiniteNumber(value) ||
    isPositionList(value) ||
    (Array.isArray(value) && value.every(isPositionList))
  );
}

const ANSWER_FORMATS: Record<LabGoal['type'], string> = {
  region_selection: 'an ISO alpha-2 country code string',
  path_drawing: 'a list of at least 2 [longitude, latitude] positions',
  polygon_drawing:
    'a single closed ring of at least 4 [longitude, latitude] positions',
  text_input: 'a string',
  multiple_choice: 'an integer option index',
};

function isClosedRing(ring: Position[]): boolean {
  const first = ring[0];
  const last = ring[ring.length - 1];

  return (
    ring.length >= 4 &&
    first !== undefined &&
    last !== undefined &&
    isSamePosition(first, last)
  );
}

function isValidAnswer(goal: LabGoal, answer: LabAnswer): boolean {
  switch (goal.type) {
    case 'region_selection':
    case 'text_input':
      return typeof answer === 'string';
    case 'multiple_choice':
      return Number.isInteger(answer);
    case 'path_drawing':
      return isPositionList(answer) && answer.length >= 2;
    case 'polygon_drawing': {
      if (!Array.isArray(answer) || answer.length !== 1) {
        return false;
      }
      const [ring] = answer;
      return isPositionList(ring) && isClosedRing(ring);
    }
    default:
      // Unknown goal types are failed during evaluation instead.
      return true;
  }
}

// Returns why `answer` cannot be evaluated against `goal`, or `null` if it can.
export function getAnswerError(
  goal: LabGoal,
  answer: LabAnswer,
): string | null {
  if (isValidAnswer(goal, answer)) {
    return null;
  }

  return `answers.${goal.id} must be ${ANSWER_FORMATS[goal.type]}`;
}

// Returns `null` when the answer is correct, otherwise why the goal failed. Reasons must never reveal `expected`.
function getFailureReason(goal: LabGoal, answer: LabAnswer): string | null {
  switch (goal.type) {
    case 'region_selection':
      return typeof answer === 'string' &&
        answer.toUpperCase() === goal.expected.iso_a2.toUpperCase()
        ? null
        : 'Incorrect region';
    case 'path_drawing':
      return isPositionList(answer) &&
        isWithinTolerance(
          answer,
          goal.expected.coordinates,
          goal.expected.tolerance_meters,
        )
        ? null
        : 'Outside tolerance';
    case 'polygon_drawing': {
      const [ring] = Array.isArray(answer) ? answer : [];
      // The outer ring of the expected polygon, closed so its last edge is checked too.
      const [expectedRing = []] = goal.expected.coordinates;

      return isPositionList(ring) &&
        isWithinTolerance(
          ring,
          closeRing(expectedRing),
          goal.expected.tolerance_meters,
        )
        ? null
        : 'Outside tolerance';
    }
    case 'text_input': {
      if (typeof answer !== 'string') {
        return 'Incorrect answer';
      }
      const submitted = answer.trim();
      const expected = goal.expected.value.trim();
      const isMatch = goal.expected.caseSensitive
        ? submitted === expected
        : submitted.toLowerCase() === expected.toLowerCase();

      return isMatch ? null : 'Incorrect answer';
    }
    case 'multiple_choice':
      return answer === goal.expected.correctIndex ? null : 'Incorrect option';
    default:
      return 'Unsupported goal type';
  }
}

export function evaluateGoal(
  goal: LabGoal,
  answer: LabAnswer | undefined,
): LabGoalResult {
  const reason =
    answer === undefined
      ? 'No answer submitted'
      : getFailureReason(goal, answer);

  return reason === null
    ? { goalId: goal.id, passed: true }
    : { goalId: goal.id, passed: false, reason };
}
