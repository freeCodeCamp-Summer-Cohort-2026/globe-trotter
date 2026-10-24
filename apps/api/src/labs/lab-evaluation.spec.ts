import type { LabGoal } from '@repo/types';
import {
  evaluateGoal,
  getAnswerError,
  isLabAnswer,
  isPosition,
} from './lab-evaluation';

type GoalOfType<T extends LabGoal['type']> = Extract<LabGoal, { type: T }>;

const regionGoal: GoalOfType<'region_selection'> = {
  id: 'goal-region',
  type: 'region_selection',
  description: 'Select Japan on the map',
  expected: { iso_a2: 'JP' },
};

const pathGoal: GoalOfType<'path_drawing'> = {
  id: 'goal-path',
  type: 'path_drawing',
  description: 'Trace the Yangtze River',
  expected: {
    coordinates: [
      [91.1, 33.4],
      [121.9, 31.4],
    ],
    tolerance_meters: 5000,
  },
};

const sriLankaRing: [number, number][] = [
  [79.7, 9.8],
  [81.9, 7.5],
  [80.6, 5.9],
  [79.7, 9.8],
];

const polygonGoal: GoalOfType<'polygon_drawing'> = {
  id: 'goal-polygon',
  type: 'polygon_drawing',
  description: 'Outline Sri Lanka',
  expected: { coordinates: [sriLankaRing], tolerance_meters: 10000 },
};

const textGoal: GoalOfType<'text_input'> = {
  id: 'goal-text',
  type: 'text_input',
  description: 'Name the capital of South Korea',
  expected: { value: 'Seoul', caseSensitive: false },
};

const choiceGoal: GoalOfType<'multiple_choice'> = {
  id: 'goal-choice',
  type: 'multiple_choice',
  description: 'Which is the most populous country in Asia?',
  options: ['Indonesia', 'India', 'Japan'],
  expected: { correctIndex: 1 },
};

describe('lab evaluation', () => {
  describe('region_selection', () => {
    it('passes on an exact, case-insensitive match of iso_a2', () => {
      expect(evaluateGoal(regionGoal, 'JP')).toEqual({
        goalId: 'goal-region',
        passed: true,
      });
      expect(evaluateGoal(regionGoal, 'jp').passed).toBe(true);
    });

    it('fails on a different region', () => {
      expect(evaluateGoal(regionGoal, 'CN')).toEqual({
        goalId: 'goal-region',
        passed: false,
        reason: 'Incorrect region',
      });
      expect(evaluateGoal(regionGoal, 'JPN').passed).toBe(false);
    });
  });

  describe('path_drawing', () => {
    it('passes when every vertex is within tolerance, including the middle of a long segment', () => {
      expect(
        evaluateGoal(pathGoal, [
          [91.12, 33.41],
          // Great circle midpoint of the ~2,900 km segment, far from both expected vertices.
          [106.67482048678679, 33.354933821706545],
          [121.88, 31.39],
        ]),
      ).toEqual({ goalId: 'goal-path', passed: true });
    });

    it('fails when any vertex is outside tolerance', () => {
      expect(
        evaluateGoal(pathGoal, [
          [91.1, 33.4],
          // ~107 km from the expected line.
          [106.5, 32.4],
          [121.9, 31.4],
        ]),
      ).toEqual({
        goalId: 'goal-path',
        passed: false,
        reason: 'Outside tolerance',
      });
    });
  });

  describe('polygon_drawing', () => {
    it('passes when every vertex of the ring is within tolerance of the expected ring', () => {
      expect(
        evaluateGoal(polygonGoal, [
          [
            [79.72, 9.79],
            [81.88, 7.51],
            [80.6, 5.92],
            [79.72, 9.79],
          ],
        ]),
      ).toEqual({ goalId: 'goal-polygon', passed: true });
    });

    it('fails when any vertex of the ring is outside tolerance', () => {
      expect(
        evaluateGoal(polygonGoal, [
          [
            [79.7, 9.8],
            [81.9, 7.5],
            // ~35 km from the expected ring.
            [81.0, 8.9],
            [79.7, 9.8],
          ],
        ]),
      ).toEqual({
        goalId: 'goal-polygon',
        passed: false,
        reason: 'Outside tolerance',
      });
    });

    it('treats the expected ring as closed even when its last position is omitted', () => {
      const openRingGoal: GoalOfType<'polygon_drawing'> = {
        ...polygonGoal,
        expected: {
          coordinates: [sriLankaRing.slice(0, -1)],
          tolerance_meters: 10000,
        },
      };

      // [80.15, 7.85] lies on the closing edge from [80.6, 5.9] back to [79.7, 9.8].
      expect(
        evaluateGoal(openRingGoal, [
          [
            [79.7, 9.8],
            [80.6, 5.9],
            [80.15, 7.85],
            [79.7, 9.8],
          ],
        ]).passed,
      ).toBe(true);
    });
  });

  describe('text_input', () => {
    it('passes on a trimmed, case-insensitive match', () => {
      expect(evaluateGoal(textGoal, '  sEOUL ')).toEqual({
        goalId: 'goal-text',
        passed: true,
      });
    });

    it('fails on a different answer', () => {
      expect(evaluateGoal(textGoal, 'Busan')).toEqual({
        goalId: 'goal-text',
        passed: false,
        reason: 'Incorrect answer',
      });
    });

    it('matches case when caseSensitive is true', () => {
      const caseSensitiveGoal: GoalOfType<'text_input'> = {
        ...textGoal,
        expected: { value: 'Seoul', caseSensitive: true },
      };

      expect(evaluateGoal(caseSensitiveGoal, ' Seoul ').passed).toBe(true);
      expect(evaluateGoal(caseSensitiveGoal, 'seoul').passed).toBe(false);
    });
  });

  describe('multiple_choice', () => {
    it('passes when the index strictly equals correctIndex', () => {
      expect(evaluateGoal(choiceGoal, 1)).toEqual({
        goalId: 'goal-choice',
        passed: true,
      });
    });

    it('fails on any other index', () => {
      expect(evaluateGoal(choiceGoal, 0)).toEqual({
        goalId: 'goal-choice',
        passed: false,
        reason: 'Incorrect option',
      });
    });
  });

  it('fails a goal that has no answer', () => {
    expect(evaluateGoal(textGoal, undefined)).toEqual({
      goalId: 'goal-text',
      passed: false,
      reason: 'No answer submitted',
    });
  });

  // Security regression guard: results must not reveal the answer key.
  it('never includes the expected answer in a result', () => {
    const results = [
      evaluateGoal(regionGoal, 'CN'),
      evaluateGoal(pathGoal, [
        [0, 0],
        [1, 1],
      ]),
      evaluateGoal(polygonGoal, [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ]),
      evaluateGoal(textGoal, 'Busan'),
      evaluateGoal(choiceGoal, 2),
    ];

    for (const result of results) {
      expect(Object.keys(result).sort()).toEqual([
        'goalId',
        'passed',
        'reason',
      ]);
    }
    const serialised = JSON.stringify(results);
    expect(serialised).not.toContain('expected');
    expect(serialised).not.toContain('JP');
    expect(serialised).not.toContain('Seoul');
    expect(serialised).not.toContain('91.1');
  });

  describe('getAnswerError', () => {
    it('accepts answers in the format of each goal type', () => {
      expect(getAnswerError(regionGoal, 'JP')).toBeNull();
      expect(
        getAnswerError(pathGoal, [
          [0, 0],
          [1, 1],
        ]),
      ).toBeNull();
      expect(getAnswerError(polygonGoal, [sriLankaRing])).toBeNull();
      expect(getAnswerError(textGoal, 'Seoul')).toBeNull();
      expect(getAnswerError(choiceGoal, 0)).toBeNull();
    });

    it('rejects answers in the wrong format for the goal type', () => {
      expect(getAnswerError(regionGoal, 1)).toBe(
        'answers.goal-region must be an ISO alpha-2 country code string',
      );
      expect(getAnswerError(textGoal, [[0, 0]])).toBe(
        'answers.goal-text must be a string',
      );
      expect(getAnswerError(choiceGoal, 1.5)).toBe(
        'answers.goal-choice must be an integer option index',
      );
      expect(getAnswerError(choiceGoal, '1')).not.toBeNull();
    });

    it('rejects a path with fewer than 2 positions', () => {
      expect(getAnswerError(pathGoal, [[91.1, 33.4]])).toBe(
        'answers.goal-path must be a list of at least 2 [longitude, latitude] positions',
      );
      expect(getAnswerError(pathGoal, [])).not.toBeNull();
    });

    it('rejects a polygon that is not a single closed ring of at least 4 positions', () => {
      const error =
        'answers.goal-polygon must be a single closed ring of at least 4 [longitude, latitude] positions';

      // Not closed.
      expect(getAnswerError(polygonGoal, [sriLankaRing.slice(0, -1)])).toBe(
        error,
      );
      // Too few positions.
      expect(
        getAnswerError(polygonGoal, [
          [
            [0, 0],
            [1, 1],
            [0, 0],
          ],
        ]),
      ).toBe(error);
      // More than one ring.
      expect(getAnswerError(polygonGoal, [sriLankaRing, sriLankaRing])).toBe(
        error,
      );
      // Not wrapped in an outer array.
      expect(getAnswerError(polygonGoal, sriLankaRing)).toBe(error);
      expect(getAnswerError(polygonGoal, [])).toBe(error);
    });
  });

  describe('isLabAnswer', () => {
    it('accepts strings, numbers, paths and rings', () => {
      expect(isLabAnswer('JP')).toBe(true);
      expect(isLabAnswer(2)).toBe(true);
      expect(isLabAnswer([[1, 2]])).toBe(true);
      expect(isLabAnswer([sriLankaRing])).toBe(true);
      expect(isLabAnswer([])).toBe(true);
    });

    it('rejects any other shape', () => {
      expect(isLabAnswer(true)).toBe(false);
      expect(isLabAnswer(null)).toBe(false);
      expect(isLabAnswer({ iso_a2: 'JP' })).toBe(false);
      expect(isLabAnswer(Infinity)).toBe(false);
      expect(isLabAnswer([1, 2])).toBe(false);
      expect(isLabAnswer([[1, 2, 3]])).toBe(false);
      expect(isLabAnswer([['1', '2']])).toBe(false);
      expect(isLabAnswer([[[1, 2]], [1, 2]])).toBe(false);
    });
  });

  describe('isPosition', () => {
    it('requires a finite longitude and a latitude between -90 and 90', () => {
      expect(isPosition([-180, 90])).toBe(true);
      expect(isPosition([0, 90.5])).toBe(false);
      expect(isPosition([NaN, 0])).toBe(false);
    });
  });
});
