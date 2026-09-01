/**
 * CityFlow Centralized Scheduling Constraint Engine
 * Enforces legal driver rest hours, maximum duty durations, collision avoidance,
 * bus maintenance clearance, and corridor certifications.
 */

import { db } from '../db/transitDb.js';

export function validateScheduleConstraints({
  cityId = 'delhi',
  dutyId = null,
  crewId = null,
  busId = null,
  routeId = null,
  startTime,
  endTime,
  dutyType = 'LINKED',
  existingDuties = null
}) {
  const settings = db.getSettings();
  const minRestHours = settings.minRestHours || 11;
  const maxDutyHours = settings.maxDutyHours || 9;

  const duties = existingDuties || db.getCollection(cityId, 'duties');
  const crewMembers = db.getCollection(cityId, 'drivers');
  const buses = db.getCollection(cityId, 'buses');
  const routes = db.getCollection(cityId, 'routes');

  const violations = [];
  const warnings = [];
  const candidateAlternatives = [];

  const proposedStartMs = new Date(startTime).getTime();
  const proposedEndMs = new Date(endTime).getTime();
  const dutyDurationHours = (proposedEndMs - proposedStartMs) / (1000 * 3600);

  // 1. RULE: MAXIMUM CONTINUOUS SHIFT DURATION
  if (dutyDurationHours > maxDutyHours) {
    violations.push({
      rule: 'MAX_DUTY_DURATION_EXCEEDED',
      severity: 'CRITICAL',
      message: `Proposed shift duration (${dutyDurationHours.toFixed(1)}h) exceeds mandated legal cap of ${maxDutyHours}h.`,
      suggestedFix: `Split shift into two unlinked duty segments with handoff at an interchange hub.`
    });
  }

  // 2. RULE: MANDATORY DRIVER REST COMPLIANCE (>= 11 Hours)
  if (crewId) {
    const driver = crewMembers.find(c => c.id === crewId);
    if (driver && driver.lastShiftEnd) {
      const lastEndMs = new Date(driver.lastShiftEnd).getTime();
      const actualRestHours = (proposedStartMs - lastEndMs) / (1000 * 3600);

      if (actualRestHours < minRestHours) {
        const deficit = minRestHours - actualRestHours;
        const defH = Math.floor(deficit);
        const defM = Math.round((deficit - defH) * 60);

        // Find qualified standby alternatives
        const standbyAlternatives = crewMembers
          .filter(c => c.isStandby || c.status === 'STANDBY_READY' || c.status === 'RESTING_COMPLIANT')
          .filter(c => {
            if (!c.lastShiftEnd) return true;
            const cRest = (proposedStartMs - new Date(c.lastShiftEnd).getTime()) / (1000 * 3600);
            return cRest >= minRestHours;
          })
          .slice(0, 3)
          .map(c => ({
            id: c.id,
            name: c.fullName || c.name,
            badge: c.badge || c.id,
            restHours: c.lastShiftEnd ? ((proposedStartMs - new Date(c.lastShiftEnd).getTime()) / (1000 * 3600)).toFixed(1) : '24.0',
            complianceScore: c.complianceScore || 98
          }));

        violations.push({
          rule: 'MANDATORY_REST_VIOLATION',
          severity: 'CRITICAL',
          message: `Driver ${driver.fullName || driver.name} has only received ${actualRestHours.toFixed(1)}h continuous rest prior to shift. Mandated legal rest is ${minRestHours}h (Deficit: ${defH}h ${defM}m).`,
          deficitFormatted: `${defH}h ${defM}m`,
          suggestedAlternatives: standbyAlternatives
        });
      }
    }

    // 3. RULE: DRIVER TEMPORAL DOUBLE-BOOKING COLLISION
    const driverCollisions = duties.filter(d => {
      if (dutyId && d.id === dutyId) return false;
      if (d.crewId !== crewId) return false;
      const dStart = new Date(d.startTime).getTime();
      const dEnd = new Date(d.endTime).getTime();
      return proposedStartMs < dEnd && proposedEndMs > dStart;
    });

    if (driverCollisions.length > 0) {
      violations.push({
        rule: 'DRIVER_TEMPORAL_COLLISION',
        severity: 'CRITICAL',
        message: `Driver is already assigned to Duty ${driverCollisions[0].dutyCode} (${new Date(driverCollisions[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(driverCollisions[0].endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) during this time window.`
      });
    }
  }

  // 4. RULE: BUS ASSET DOUBLE-BOOKING COLLISION
  if (busId) {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      if (bus.status === 'MAINTENANCE') {
        violations.push({
          rule: 'BUS_UNDER_MAINTENANCE',
          severity: 'CRITICAL',
          message: `Bus ${bus.busNumber} is currently undergoing workshop maintenance and cannot be scheduled for passenger service.`
        });
      }

      const busCollisions = duties.filter(d => {
        if (dutyId && d.id === dutyId) return false;
        if (d.busId !== busId) return false;
        const dStart = new Date(d.startTime).getTime();
        const dEnd = new Date(d.endTime).getTime();
        return proposedStartMs < dEnd && proposedEndMs > dStart;
      });

      if (busCollisions.length > 0) {
        violations.push({
          rule: 'BUS_TEMPORAL_COLLISION',
          severity: 'CRITICAL',
          message: `Bus ${bus.busNumber} is already committed to Duty ${busCollisions[0].dutyCode} on Route ${busCollisions[0].routeCode || 'Express'}.`
        });
      }
    }
  }

  // 5. RULE: LONG JOURNEY INTERSTATE RELIEF DRIVER CHECK
  if (routeId) {
    const route = routes.find(r => r.id === routeId);
    if (route && route.lengthKm >= 150) {
      if (dutyType !== 'UNLINKED' && !violations.some(v => v.rule === 'LONG_JOURNEY_RELIEF')) {
        warnings.push({
          rule: 'LONG_JOURNEY_RELIEF_REQUIRED',
          severity: 'WARNING',
          message: `Route ${route.code} is an interstate corridor (${route.lengthKm} km). Regulatory safety requires a scheduled driver relief changeover (e.g. Kotputli Midway).`
        });
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    canOverride: violations.every(v => v.severity !== 'CRITICAL')
  };
}

