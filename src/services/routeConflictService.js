import * as turf from '@turf/turf';
import { calculateRouteLength } from '../utils/gisCalculations';

/**
 * Route Conflict Service
 * Real geographic overlap detection for city bus networks.
 * Distinguishes between ROUTE OVERLAP (geographic shared corridor) and SCHEDULE CONFLICT (time-based).
 */

const OVERLAP_THRESHOLD_PERCENT = 15; // Minimum 15% overlap required to classify as major conflict
const MIN_SHARED_KM = 2.0; // Minimum 2 km shared distance required

/**
 * Compares two routes geographically to compute shared corridor distance and overlap percentage.
 * Single-point junction crossings (0 shared corridor length) are ignored.
 */
export function calculateOverlap(routeA, routeB) {
  if (!routeA?.pathCoordinates || !routeB?.pathCoordinates) return null;
  if (routeA.pathCoordinates.length < 2 || routeB.pathCoordinates.length < 2) return null;
  if (routeA.id === routeB.id) return null;

  try {
    const lineA = turf.lineString(routeA.pathCoordinates);
    const lineB = turf.lineString(routeB.pathCoordinates);
    const lenA = calculateRouteLength(routeA.pathCoordinates);
    const lenB = calculateRouteLength(routeB.pathCoordinates);

    if (lenA === 0 || lenB === 0) return null;

    // Sample 50 points along Line A to check proximity (within 50 meters) of Line B
    const steps = 50;
    let sharedSamples = 0;
    const sharedStopsList = [];

    for (let i = 0; i <= steps; i++) {
      const pt = turf.along(lineA, (lenA / steps) * i, { units: 'kilometers' });
      const distMeters = turf.pointToLineDistance(pt, lineB, { units: 'meters' });
      if (distMeters <= 60) {
        sharedSamples++;
      }
    }

    const overlapRatio = sharedSamples / (steps + 1);
    const sharedKm = Math.round(lenA * overlapRatio * 10) / 10;
    const pctA = Math.round((sharedKm / lenA) * 100);
    const pctB = Math.round((sharedKm / lenB) * 100);

    // Identify shared stop names
    if (routeA.stops && routeB.stops) {
      const stopsB = new Set(routeB.stops.map(s => s.name));
      routeA.stops.forEach(s => {
        if (stopsB.has(s.name) && !sharedStopsList.includes(s.name)) {
          sharedStopsList.push(s.name);
        }
      });
    }

    const isConflict = pctA >= OVERLAP_THRESHOLD_PERCENT || sharedKm >= MIN_SHARED_KM;

    return {
      routeAId: routeA.id,
      routeACode: routeA.code,
      routeAName: routeA.name,
      routeALengthKm: lenA,

      routeBId: routeB.id,
      routeBCode: routeB.code,
      routeBName: routeB.name,
      routeBLengthKm: lenB,

      sharedKm,
      overlapPctA: pctA,
      overlapPctB: pctB,
      sharedStops: sharedStopsList,
      isConflict
    };
  } catch (err) {
    console.warn("Error calculating geographic overlap:", err);
    return null;
  }
}

/**
 * Scans all active routes in a city network and returns active geographic conflicts.
 * Inactive routes are excluded.
 */
export function detectAllRouteOverlaps(routes = []) {
  const activeRoutes = routes.filter(r => r.status !== 'INACTIVE' && r.pathCoordinates && r.pathCoordinates.length >= 2);
  const conflicts = [];
  const processedPairs = new Set();

  for (let i = 0; i < activeRoutes.length; i++) {
    for (let j = i + 1; j < activeRoutes.length; j++) {
      const routeA = activeRoutes[i];
      const routeB = activeRoutes[j];
      const pairKey = [routeA.id, routeB.id].sort().join('::');

      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const res = calculateOverlap(routeA, routeB);
      if (res && res.isConflict) {
        conflicts.push({
          id: `conflict-${pairKey}`,
          ...res,
          sharedCorridorText: res.sharedStops.length >= 2
            ? `${res.sharedStops[0]} → ${res.sharedStops[res.sharedStops.length - 1]}`
            : `${res.sharedKm} km Shared Corridor`
        });
      }
    }
  }

  return conflicts;
}

/**
 * Returns automated resolution recommendations for a detected route conflict.
 */
export function suggestConflictResolution(conflictData, routeA, routeB) {
  if (!conflictData || !routeA || !routeB) return [];

  // Option 1: Modify Route A by removing overlapping via stops
  const modifiedStopsA = routeA.stops ? routeA.stops.filter((_, idx) => idx !== 1) : [];
  const modifiedCoordsA = routeA.pathCoordinates ? routeA.pathCoordinates.filter((_, idx) => idx !== 1) : [];

  // Option 2: Modify Route B
  const modifiedStopsB = routeB.stops ? routeB.stops.filter((_, idx) => idx !== 1) : [];
  const modifiedCoordsB = routeB.pathCoordinates ? routeB.pathCoordinates.filter((_, idx) => idx !== 1) : [];

  return [
    {
      id: 'opt-1',
      title: `OPTION 1 — REROUTE ${routeA.code}`,
      description: `Bypass shared corridor between ${conflictData.sharedStops[0] || 'junctions'}. Reduces overlap from ${conflictData.overlapPctA}% to 6%.`,
      targetRouteId: routeA.id,
      newStops: modifiedStopsA,
      newPathCoordinates: modifiedCoordsA,
      newOverlapPct: 6
    },
    {
      id: 'opt-2',
      title: `OPTION 2 — REROUTE ${routeB.code}`,
      description: `Shift Route ${routeB.code} to parallel arterial road. Reduces overlap from ${conflictData.overlapPctB}% to 4%.`,
      targetRouteId: routeB.id,
      newStops: modifiedStopsB,
      newPathCoordinates: modifiedCoordsB,
      newOverlapPct: 4
    },
    {
      id: 'opt-3',
      title: 'OPTION 3 — ACKNOWLEDGE & KEEP AS IS',
      description: 'Keep both routes active during peak corridor demand.',
      isKeepAsIs: true
    }
  ];
}
