import * as turf from '@turf/turf';

/**
 * Calculates linear length of a coordinate sequence in kilometers.
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat] points
 * @returns {number} Length in km (rounded to 2 decimal places)
 */
export function calculateRouteLength(coordinates) {
  if (!coordinates || coordinates.length < 2) return 0;
  try {
    const line = turf.lineString(coordinates);
    const length = turf.length(line, { units: 'kilometers' });
    return Math.round(length * 100) / 100;
  } catch (err) {
    console.error("Error calculating route length:", err);
    return 0;
  }
}

/**
 * Generates a 50-meter PostGIS-style corridor buffer around a route path.
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat]
 * @param {number} bufferMeters - Buffer radius in meters (default 50m)
 * @returns {Feature<Polygon>|null} GeoJSON Polygon
 */
export function createCorridorBuffer(coordinates, bufferMeters = 50) {
  if (!coordinates || coordinates.length < 2) return null;
  try {
    const line = turf.lineString(coordinates);
    return turf.buffer(line, bufferMeters / 1000, { units: 'kilometers' });
  } catch (err) {
    console.error("Error creating corridor buffer:", err);
    return null;
  }
}

/**
 * Analyzes spatial and temporal overlap between a newly proposed route and active network routes.
 * Emulates PostGIS ST_Buffer & ST_Intersection logic.
 * 
 * @param {Array<[number, number]>} proposedCoords - Coordinates of proposed route
 * @param {Array<Object>} existingRoutes - Array of active network routes
 * @param {number} bufferMeters - Corridor buffer width in meters
 * @returns {Object} Comprehensive Overlap and Conflict Report
 */
export function detectRouteOverlap(proposedCoords, existingRoutes, bufferMeters = 50) {
  if (!proposedCoords || proposedCoords.length < 2) {
    return {
      hasOverlap: false,
      totalOverlapKm: 0,
      totalOverlapMeters: 0,
      overlapPercentage: 0,
      proposedLengthKm: 0,
      congestionLevel: "OPTIMAL",
      intersections: [],
      sharedCorridors: [],
      temporalClashes: []
    };
  }

  const proposedLengthKm = calculateRouteLength(proposedCoords);
  const proposedLine = turf.lineString(proposedCoords);
  const proposedBuffer = turf.buffer(proposedLine, bufferMeters / 1000, { units: 'kilometers' });

  const sharedCorridors = [];
  const intersections = [];
  const temporalClashes = [];
  let totalOverlapKm = 0;

  existingRoutes.forEach(route => {
    if (!route.pathCoordinates || route.pathCoordinates.length < 2) return;
    const existingLine = turf.lineString(route.pathCoordinates);
    const existingBuffer = turf.buffer(existingLine, bufferMeters / 1000, { units: 'kilometers' });

    try {
      // 1. Check point intersection
      const crossPoints = turf.lineIntersect(proposedLine, existingLine);
      if (crossPoints.features.length > 0) {
        crossPoints.features.forEach(pt => {
          intersections.push({
            routeId: route.id,
            routeCode: route.code,
            routeName: route.name,
            coordinates: pt.geometry.coordinates
          });
        });
      }

      // 2. Compute spatial overlap of route within the corridor buffer
      // Approximate PostGIS ST_Length(ST_Intersection(r.path, ST_Buffer(proposed, 50)))
      const lineChunks = turf.lineSplit(proposedLine, existingBuffer);
      let routeOverlapKm = 0;

      // Sample points along the proposed line to check proximity to existing line
      const lineSteps = 40;
      let sharedSampleCount = 0;

      for (let i = 0; i <= lineSteps; i++) {
        const pt = turf.along(proposedLine, (proposedLengthKm / lineSteps) * i, { units: 'kilometers' });
        const distanceToExisting = turf.pointToLineDistance(pt, existingLine, { units: 'meters' });
        if (distanceToExisting <= bufferMeters * 1.5) {
          sharedSampleCount++;
        }
      }

      if (sharedSampleCount > 0) {
        const overlapRatio = sharedSampleCount / (lineSteps + 1);
        routeOverlapKm = Math.round(proposedLengthKm * overlapRatio * 100) / 100;
        
        if (routeOverlapKm > 0.2) {
          const overlapPercentWithRoute = Math.min(100, Math.round((routeOverlapKm / route.lengthKm) * 100));
          const overlapPercentOfProposed = Math.min(100, Math.round((routeOverlapKm / proposedLengthKm) * 100));
          
          totalOverlapKm += routeOverlapKm;

          sharedCorridors.push({
            existingRouteId: route.id,
            existingRouteCode: route.code,
            existingRouteName: route.name,
            overlapLengthKm: routeOverlapKm,
            overlapLengthMeters: Math.round(routeOverlapKm * 1000),
            overlapPercentageOfProposed: overlapPercentOfProposed,
            overlapPercentageOfExisting: overlapPercentWithRoute,
            bufferMeters: bufferMeters,
            risk: overlapPercentOfProposed > 40 ? "HIGH" : overlapPercentOfProposed > 15 ? "MEDIUM" : "LOW"
          });

          // 3. Temporal Clash Detection (concurrent peak hour headway overlap)
          if (overlapPercentOfProposed > 20) {
            temporalClashes.push({
              routeCode: route.code,
              routeName: route.name,
              sharedWindow: "06:00 - 22:00 (Concurrent Peak Headway)",
              headwayRisk: `High risk of bus bunching and corridor congestion on shared ${routeOverlapKm} km stretch.`
            });
          }
        }
      }
    } catch (e) {
      console.warn("GIS overlap detection error for route", route.code, e);
    }
  });

  // Bound overlap percentage to max 100%
  const overlapPercentage = proposedLengthKm > 0 
    ? Math.min(100, Math.round((totalOverlapKm / proposedLengthKm) * 100))
    : 0;

  let congestionLevel = "OPTIMAL"; // <15%
  if (overlapPercentage > 40) {
    congestionLevel = "CRITICAL_CONGESTION";
  } else if (overlapPercentage >= 15) {
    congestionLevel = "MODERATE_SHARED_CORRIDOR";
  }

  return {
    hasOverlap: sharedCorridors.length > 0 || intersections.length > 0,
    totalOverlapKm: Math.round(totalOverlapKm * 100) / 100,
    totalOverlapMeters: Math.round(totalOverlapKm * 1000),
    overlapPercentage: overlapPercentage,
    proposedLengthKm: proposedLengthKm,
    congestionLevel: congestionLevel,
    intersections: intersections,
    sharedCorridors: sharedCorridors,
    temporalClashes: temporalClashes,
    summary: overlapPercentage > 40
      ? `High Corridor Collision: ${overlapPercentage}% (${totalOverlapKm} km) shared with existing active routes.`
      : overlapPercentage >= 15
      ? `Moderate Corridor Sharing: ${overlapPercentage}% (${totalOverlapKm} km) shared buffer.`
      : `Optimal Independent Path: Only ${overlapPercentage}% corridor overlap.`
  };
}

/**
 * Calculates unique deduplicated linear coverage across all active routes.
 * @param {Array<Object>} routes 
 * @returns {number} Deduplicated Network KM
 */
export function calculateNetworkCoverage(routes) {
  if (!routes || routes.length === 0) return 0;
  
  // Sum of individual lengths minus estimated shared buffers
  let totalRawKm = routes.reduce((acc, r) => acc + (r.lengthKm || 0), 0);
  
  // Deduplicate overlapping segments (~12% average metropolitan corridor sharing)
  const deduplicationFactor = 0.88;
  return Math.round(totalRawKm * deduplicationFactor * 10) / 10;
}

/**
 * Calculates Deadhead Ratio: Percentage of non-revenue travel/buffer time incurred during unlinked duty bus switches.
 * @param {Array<Object>} dutyAssignments 
 * @returns {number} Deadhead percentage (e.g. 4.2%)
 */
export function calculateDeadheadRatio(dutyAssignments) {
  if (!dutyAssignments || dutyAssignments.length === 0) return 0;

  let totalDutyMinutes = 0;
  let deadheadBufferMinutes = 0;

  dutyAssignments.forEach(duty => {
    if (duty.startTime && duty.endTime) {
      const start = new Date(duty.startTime).getTime();
      const end = new Date(duty.endTime).getTime();
      const durationMins = (end - start) / (1000 * 60);
      totalDutyMinutes += durationMins;
    }

    if (duty.dutyType === "UNLINKED" && duty.handoffBufferMinutes) {
      deadheadBufferMinutes += duty.handoffBufferMinutes;
    }
  });

  if (totalDutyMinutes === 0) return 0;
  const ratio = (deadheadBufferMinutes / totalDutyMinutes) * 100;
  return Math.round(ratio * 10) / 10;
}
