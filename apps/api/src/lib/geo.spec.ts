import {
  EARTH_RADIUS_METERS,
  closeRing,
  distanceToLine,
  distanceToSegment,
  haversineDistance,
  isWithinTolerance,
} from './geo';

// Length of one degree of arc along a great circle (e.g. the equator).
const ONE_DEGREE_METERS = (2 * Math.PI * EARTH_RADIUS_METERS) / 360;

describe('geo', () => {
  describe('haversineDistance', () => {
    it('returns 0 for the same position', () => {
      expect(haversineDistance([12.5, 41.9], [12.5, 41.9])).toBe(0);
    });

    it('measures one degree of longitude along the equator', () => {
      expect(haversineDistance([0, 0], [1, 0])).toBeCloseTo(
        ONE_DEGREE_METERS,
        3,
      );
    });

    it('measures a quarter of the circumference from the equator to the pole', () => {
      expect(haversineDistance([0, 0], [0, 90])).toBeCloseTo(
        (Math.PI * EARTH_RADIUS_METERS) / 2,
        3,
      );
    });

    it('matches the known distance between London and Paris', () => {
      const london = [-0.1278, 51.5074] as const;
      const paris = [2.3522, 48.8566] as const;

      expect(haversineDistance(london, paris)).toBeCloseTo(343_556, 0);
      expect(haversineDistance(paris, london)).toBeCloseTo(
        haversineDistance(london, paris),
        6,
      );
    });

    it('takes the short way across the antimeridian', () => {
      expect(haversineDistance([179.5, 0], [-179.5, 0])).toBeCloseTo(
        ONE_DEGREE_METERS,
        3,
      );
    });
  });

  describe('distanceToSegment', () => {
    const start = [0, 0] as const;
    const end = [10, 0] as const;

    it('measures to the middle of a long segment, not just its endpoints', () => {
      // The midpoint is ~556 km from both endpoints but lies on the segment.
      expect(distanceToSegment([5, 0], start, end)).toBeCloseTo(0, 3);
    });

    it('returns the perpendicular (cross-track) distance when the point projects onto the segment', () => {
      expect(distanceToSegment([5, 0.1], start, end)).toBeCloseTo(
        ONE_DEGREE_METERS / 10,
        3,
      );
    });

    it('returns the distance to the nearest endpoint when the point projects outside the segment', () => {
      expect(distanceToSegment([-1, 0], start, end)).toBeCloseTo(
        ONE_DEGREE_METERS,
        3,
      );
      expect(distanceToSegment([12, 0], start, end)).toBeCloseTo(
        2 * ONE_DEGREE_METERS,
        3,
      );
    });

    it('follows the great circle rather than a straight line in longitude/latitude', () => {
      const yangtzeSource = [91.1, 33.4] as const;
      const yangtzeMouth = [121.9, 31.4] as const;

      // Great circle midpoint of the segment.
      expect(
        distanceToSegment(
          [106.67482048678679, 33.354933821706545],
          yangtzeSource,
          yangtzeMouth,
        ),
      ).toBeCloseTo(0, 3);
      // Averaging longitude/latitude lands ~107 km south of the great circle.
      expect(
        distanceToSegment([106.5, 32.4], yangtzeSource, yangtzeMouth),
      ).toBeGreaterThan(100_000);
    });

    it('treats a zero-length segment as a point', () => {
      expect(distanceToSegment([1, 0], start, start)).toBeCloseTo(
        ONE_DEGREE_METERS,
        3,
      );
    });
  });

  describe('distanceToLine', () => {
    const line = [
      [0, 0],
      [10, 0],
      [10, 10],
    ] as const;

    it('returns the shortest distance to any segment of the line', () => {
      const point = [11, 5] as const;

      expect(distanceToLine(point, line)).toBe(
        Math.min(
          distanceToSegment(point, [0, 0], [10, 0]),
          distanceToSegment(point, [10, 0], [10, 10]),
        ),
      );
      expect(distanceToLine([5, -1], line)).toBeCloseTo(ONE_DEGREE_METERS, 3);
    });

    it('treats a single-position line as a point', () => {
      expect(distanceToLine([1, 0], [[0, 0]])).toBeCloseTo(
        ONE_DEGREE_METERS,
        3,
      );
    });

    it('returns Infinity for an empty line', () => {
      expect(distanceToLine([0, 0], [])).toBe(Infinity);
    });
  });

  describe('isWithinTolerance', () => {
    const line = [
      [0, 0],
      [10, 0],
    ] as const;

    it('passes when every vertex is within the tolerance', () => {
      expect(
        isWithinTolerance(
          [
            [0, 0.01],
            [5, -0.01],
            [10, 0.01],
          ],
          line,
          5_000,
        ),
      ).toBe(true);
    });

    it('fails when any vertex is outside the tolerance', () => {
      expect(
        isWithinTolerance(
          [
            [0, 0],
            [5, 0.1],
            [10, 0],
          ],
          line,
          5_000,
        ),
      ).toBe(false);
    });
  });

  describe('closeRing', () => {
    it('repeats the first position at the end of an open ring', () => {
      expect(
        closeRing([
          [0, 0],
          [1, 0],
          [1, 1],
        ]),
      ).toEqual([
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ]);
    });

    it('leaves a closed ring unchanged', () => {
      const ring = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ] as const;

      expect(closeRing(ring)).toEqual(ring);
    });
  });
});
