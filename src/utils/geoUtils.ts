import { Coordinates } from '../types/transit';

/**
 * Calculates distance between two coordinates in meters (Haversine formula)
 */
export function getDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Earth radius in meters
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates bearing / heading in degrees from coord1 to coord2 (0 = North, 90 = East)
 */
export function getBearing(coord1: Coordinates, coord2: Coordinates): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Interpolates position along a multi-segment route polyline given progress 0..1
 */
export function interpolateRoutePosition(
  coordinates: Coordinates[],
  progress: number
): { coord: Coordinates; heading: number; segmentIndex: number } {
  if (!coordinates || coordinates.length === 0) {
    return { coord: [80.23, 13.04], heading: 0, segmentIndex: 0 };
  }
  if (coordinates.length === 1) {
    return { coord: coordinates[0], heading: 0, segmentIndex: 0 };
  }

  // Calculate segment lengths
  const segmentDistances: number[] = [];
  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const d = getDistanceMeters(coordinates[i], coordinates[i + 1]);
    segmentDistances.push(d);
    totalDistance += d;
  }

  if (totalDistance === 0) {
    return { coord: coordinates[0], heading: 0, segmentIndex: 0 };
  }

  const targetDist = Math.max(0, Math.min(1, progress)) * totalDistance;
  let accumulated = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    const segDist = segmentDistances[i];
    if (accumulated + segDist >= targetDist || i === segmentDistances.length - 1) {
      const segProgress = segDist === 0 ? 0 : (targetDist - accumulated) / segDist;
      const [lon1, lat1] = coordinates[i];
      const [lon2, lat2] = coordinates[i + 1];

      const lon = lon1 + (lon2 - lon1) * segProgress;
      const lat = lat1 + (lat2 - lat1) * segProgress;
      const heading = getBearing(coordinates[i], coordinates[i + 1]);

      return { coord: [lon, lat], heading, segmentIndex: i };
    }
    accumulated += segDist;
  }

  return {
    coord: coordinates[coordinates.length - 1],
    heading: getBearing(coordinates[coordinates.length - 2], coordinates[coordinates.length - 1]),
    segmentIndex: coordinates.length - 2,
  };
}
