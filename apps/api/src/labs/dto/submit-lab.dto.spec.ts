import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SubmitLabDto } from './submit-lab.dto';

const validateBody = async (body: unknown) => {
  const errors = await validate(plainToInstance(SubmitLabDto, body));
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
};

describe('SubmitLabDto', () => {
  it('accepts every answer shape', async () => {
    await expect(
      validateBody({
        answers: {
          region: 'JP',
          text: 'Seoul',
          choice: 1,
          path: [
            [91.1, 33.4],
            [121.9, 31.4],
          ],
          polygon: [
            [
              [79.7, 9.8],
              [81.9, 7.5],
              [80.6, 5.9],
              [79.7, 9.8],
            ],
          ],
        },
      }),
    ).resolves.toEqual([]);
  });

  it.each([
    ['missing', {}],
    ['null', { answers: null }],
    ['an array', { answers: [] }],
    ['a string', { answers: 'JP' }],
  ])('rejects answers that are %s', async (_, body) => {
    await expect(validateBody(body)).resolves.toEqual([
      'answers must be an object',
    ]);
  });

  it.each([
    ['a boolean', true],
    ['an object', { iso_a2: 'JP' }],
    ['a position with 3 coordinates', [[1, 2, 3]]],
    ['a position with an invalid latitude', [[0, 91]]],
    ['a list of non-numeric positions', [['91.1', '33.4']]],
  ])('rejects an answer that is %s', async (_, answer) => {
    const errors = await validateBody({ answers: { goal: answer } });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/^each answer must be/);
  });
});
