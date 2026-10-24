// Positions use GeoJSON order: [longitude, latitude] in degrees.
export type LngLat = readonly [longitude: number, latitude: number];

// Mean radius of the Earth.
export const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

// Angular distance in radians between two positions, using the Haversine formula.
function centralAngle([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = phi2 - phi1;
  const deltaLambda = toRadians(lng2 - lng1);

  const h =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Initial bearing in radians (clockwise from north) of the great circle path from `from` to `to`.
function initialBearing([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLambda = toRadians(lng2 - lng1);

  return Math.atan2(
    Math.sin(deltaLambda) * Math.cos(phi2),
    Math.cos(phi1) * Math.sin(phi2) -
      Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda),
  );
}

// Great circle distance in meters between two positions.
export function haversineDistance(from: LngLat, to: LngLat): number {
  return centralAngle(from, to) * EARTH_RADIUS_METERS;
}

export function isSamePosition(a: LngLat, b: LngLat): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * Shortest distance in meters from `point` to the great circle segment between `start` and `end`.
 * When the point projects onto the segment this is the cross-track distance, so points near the
 * middle of a long segment are measured correctly; otherwise it is the distance to the nearest endpoint.
 */
export function distanceToSegment(
  point: LngLat,
  start: LngLat,
  end: LngLat,
): number {
  const segmentAngle = centralAngle(start, end);
  const startAngle = centralAngle(start, point);

  if (segmentAngle === 0 || startAngle === 0) {
    return startAngle * EARTH_RADIUS_METERS;
  }

  const bearingDelta =
    initialBearing(start, point) - initialBearing(start, end);
  const crossTrackAngle = Math.asin(
    Math.sin(startAngle) * Math.sin(bearingDelta),
  );
  // Signed angular distance from `start` to the point's projection onto the great circle.
  const alongTrackAngle = Math.atan2(
    Math.sin(startAngle) * Math.cos(bearingDelta),
    Math.cos(startAngle),
  );

  if (alongTrackAngle > 0 && alongTrackAngle < segmentAngle) {
    return Math.abs(crossTrackAngle) * EARTH_RADIUS_METERS;
  }

  return Math.min(startAngle, centralAngle(end, point)) * EARTH_RADIUS_METERS;
}

// Shortest distance in meters from `point` to any segment of `line`. A single-position line is treated as a point.
export function distanceToLine(point: LngLat, line: readonly LngLat[]): number {
  let shortest = Infinity;
  let previous: LngLat | undefined;

  for (const vertex of line) {
    const distance = previous
      ? distanceToSegment(point, previous, vertex)
      : haversineDistance(point, vertex);
    shortest = Math.min(shortest, distance);
    previous = vertex;
  }

  return shortest;
}

// True when every vertex is within `toleranceMeters` of the nearest segment of `line`.
export function isWithinTolerance(
  vertices: readonly LngLat[],
  line: readonly LngLat[],
  toleranceMeters: number,
): boolean {
  return vertices.every(
    (vertex) => distanceToLine(vertex, line) <= toleranceMeters,
  );
}

// Returns the ring with its first position repeated at the end, unless it is already closed.
export function closeRing(ring: readonly LngLat[]): LngLat[] {
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (!first || !last || isSamePosition(first, last)) {
    return [...ring];
  }

  return [...ring, first];
}
