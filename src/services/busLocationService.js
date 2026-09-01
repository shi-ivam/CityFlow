/**
 * Isolated Bus Location & Movement Simulation Service
 * Smoothly interpolates bus coordinates along GeoJSON route polylines over time.
 */

export function computeBusPositions(busFleet, routes, dutyAssignments, operationalTimeMins) {
  return busFleet.map((bus, index) => {
    if (!bus.assignedRoute || bus.status === 'MAINTENANCE' || bus.status === 'CANCELLED') {
      return {
        ...bus,
        currentLocation: null,
        nextStop: 'Depot',
        etaMins: 0,
        speedKmH: 0,
        occupancyRatio: '0 / 50',
        liveStatus: bus.status === 'CANCELLED' ? 'CANCELLED' : 'IDLE'
      };
    }

    const route = routes.find(r => r.code === bus.assignedRoute || r.id === bus.assignedRoute);
    if (!route || !route.pathCoordinates || route.pathCoordinates.length < 2) {
      return {
        ...bus,
        currentLocation: null,
        nextStop: 'Unknown',
        etaMins: 0,
        speedKmH: 0,
        occupancyRatio: '0 / 50',
        liveStatus: 'UNKNOWN'
      };
    }

    const path = route.pathCoordinates;
    const totalSegments = path.length - 1;
    
    // Smooth progress based on operational time + offset per bus
    const speedFactor = 0.08;
    const offset = index * 3.2;
    const rawProgress = ((operationalTimeMins * speedFactor) + offset) % totalSegments;
    const baseIdx = Math.floor(rawProgress);
    const frac = rawProgress - baseIdx;

    const p1 = path[baseIdx];
    const p2 = path[Math.min(totalSegments, baseIdx + 1)];

    // Interpolate [lng, lat]
    const lng = p1[0] + (p2[0] - p1[0]) * frac;
    const lat = p1[1] + (p2[1] - p1[1]) * frac;

    // Determine next stop
    const stops = route.stops || [];
    const stopIdx = Math.min(stops.length - 1, Math.floor((rawProgress / totalSegments) * stops.length));
    const nextStopObj = stops[stopIdx] || stops[0] || { name: 'Rajiv Chowk' };
    const etaMins = Math.max(1, Math.round((1 - frac) * 8));

    // Dynamic simulated occupancy
    const maxCap = bus.capacity || 50;
    const currPassengers = Math.min(maxCap + 10, Math.round(maxCap * 0.76 + (index % 3) * 5));

    // Determine live status
    let liveStatus = 'ON_TIME';
    if (bus.isDelayed || index === 1) liveStatus = 'DELAYED';
    if (bus.hasDriverIssue) liveStatus = 'DRIVER_ISSUE';
    if (currPassengers > maxCap) liveStatus = 'OVERFLOW';

    return {
      ...bus,
      currentLocation: [lat, lng],
      nextStop: nextStopObj.name,
      etaMins,
      speedKmH: Math.round(28 + (index % 4) * 4),
      passengersCount: currPassengers,
      occupancyRatio: `${currPassengers} / ${maxCap}`,
      liveStatus,
      routeCode: route.code,
      routeName: route.name
    };
  });
}
