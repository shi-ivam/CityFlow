/**
 * vehicleService.js
 * Comprehensive business logic and domain engine for CityFlow Fleet Command Center.
 * Handles validation, state transitions, conflict checks, predictive maintenance,
 * compliance calculations, trip readiness, EV charging intelligence, and natural language search.
 */

// Calculate document expiration status and remaining days
export function calculateDocumentCompliance(expiryDateStr) {
  if (!expiryDateStr) return { status: 'UNKNOWN', daysRemaining: 0, label: 'No record' };
  
  const now = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: 'EXPIRED',
      daysRemaining: Math.abs(daysRemaining),
      label: `Expired ${Math.abs(daysRemaining)} days ago`,
      isCritical: true
    };
  } else if (daysRemaining <= 30) {
    return {
      status: 'EXPIRING_SOON',
      daysRemaining,
      label: `Expires in ${daysRemaining} days`,
      isWarning: true
    };
  } else {
    return {
      status: 'VALID',
      daysRemaining,
      label: `Valid (${daysRemaining} days left)`,
      isValid: true
    };
  }
}

// Calculate comprehensive fleet summary statistics dynamically
export function calculateFleetMetrics(busFleet = []) {
  const total = busFleet.length;
  const inService = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const available = busFleet.filter(b => b.status === 'STANDBY_READY' || b.status === 'AVAILABLE').length;
  const standby = available;
  const maintenance = busFleet.filter(b => b.status === 'MAINTENANCE').length;
  const offline = busFleet.filter(b => b.status === 'OFFLINE').length;
  const retired = busFleet.filter(b => b.status === 'RETIRED').length;
  
  // Moving vs Stopped
  const moving = busFleet.filter(b => b.status === 'IN_SERVICE' && (b.speedKmH > 0)).length;
  const stopped = busFleet.filter(b => b.status === 'IN_SERVICE' && (b.speedKmH === 0 || !b.speedKmH)).length;
  
  // Maintenance due within 15 days
  const maintenanceDueSoon = busFleet.filter(b => {
    if (!b.nextServiceDate) return false;
    const days = Math.ceil((new Date(b.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 15;
  }).length;

  // Critical Assets (battery <= 20% or status === MAINTENANCE or expired doc)
  const critical = busFleet.filter(b => {
    const isLowBattery = (b.batteryPct || 100) <= 20;
    const isMaint = b.status === 'MAINTENANCE';
    const hasExpiredDoc = b.compliance && Object.values(b.compliance).some(d => calculateDocumentCompliance(d).status === 'EXPIRED');
    return isLowBattery || isMaint || hasExpiredDoc;
  }).length;

  // Compliance alerts (expiring <= 30 days or expired)
  const complianceAlerts = busFleet.filter(b => {
    if (!b.compliance) return false;
    const dates = Object.values(b.compliance);
    return dates.some(d => {
      const comp = calculateDocumentCompliance(d);
      return comp.status === 'EXPIRED' || comp.status === 'EXPIRING_SOON';
    });
  }).length;

  const utilizationPct = total > 0 ? Number(((inService / total) * 100).toFixed(1)) : 0;
  const healthPct = total > 0 ? Math.round(((inService + standby) / total) * 100) : 100;

  return {
    total,
    inService,
    available,
    standby,
    maintenance,
    offline,
    retired,
    critical,
    moving,
    stopped,
    maintenanceDueSoon,
    complianceAlerts,
    utilizationPct,
    healthPct
  };
}

// Calculate transparent Fleet Readiness Score (0 - 100%)
export function calculateFleetReadinessScore(busFleet = [], crewMembers = []) {
  const totalVehicles = busFleet.length || 1;
  const inServiceOrReady = busFleet.filter(b => b.status === 'IN_SERVICE' || b.status === 'STANDBY_READY' || b.status === 'AVAILABLE').length;
  const operationalAvailability = Math.round((inServiceOrReady / totalVehicles) * 100);

  const nonMaintenance = busFleet.filter(b => b.status !== 'MAINTENANCE').length;
  const maintenanceReadiness = Math.round((nonMaintenance / totalVehicles) * 100);

  const onlineGps = busFleet.filter(b => b.gpsStatus !== 'OFFLINE').length;
  const telemetryConnectivity = Math.round((onlineGps / totalVehicles) * 100);

  const validDocs = busFleet.filter(b => {
    if (!b.compliance) return true;
    return !Object.values(b.compliance).some(d => calculateDocumentCompliance(d).status === 'EXPIRED');
  }).length;
  const complianceScore = Math.round((validDocs / totalVehicles) * 100);

  const assignedDriversCount = busFleet.filter(b => b.assignedDriver).length;
  const activeRoutesCount = busFleet.filter(b => b.assignedRoute).length || 1;
  const driverCoverage = Math.min(100, Math.round((assignedDriversCount / activeRoutesCount) * 100));

  const totalScore = Math.round(
    operationalAvailability * 0.30 +
    maintenanceReadiness * 0.20 +
    telemetryConnectivity * 0.20 +
    complianceScore * 0.15 +
    driverCoverage * 0.15
  );

  return {
    totalScore,
    breakdown: {
      operationalAvailability,
      maintenanceReadiness,
      telemetryConnectivity,
      complianceScore,
      driverCoverage
    }
  };
}

// Validate vehicle assignment against driver and maintenance conflicts
export function validateVehicleAssignment(vehicle, driver, shiftTime, allVehicles = []) {
  const errors = [];
  const warnings = [];

  if (!vehicle) return { isValid: false, errors: ['No vehicle specified'], warnings: [] };

  // 1. Vehicle Maintenance Check
  if (vehicle.status === 'MAINTENANCE') {
    errors.push(`Vehicle ${vehicle.busNumber} is under active maintenance and cannot be dispatched to an active route.`);
  }

  // 2. Driver Rest Compliance Check
  if (driver) {
    if (driver.status === 'REST_VIOLATION' || (driver.accumulatedHours || 0) >= 8) {
      warnings.push(`Driver ${driver.fullName || driver.name} has logged ${driver.accumulatedHours || 8}h of duty. Mandatory 11-hour continuous rest period is required.`);
    }

    // 3. Driver Double-Booking Check
    const conflictingVehicle = allVehicles.find(v => 
      v.id !== vehicle.id && 
      v.driverId === driver.id && 
      v.status === 'IN_SERVICE'
    );
    if (conflictingVehicle) {
      warnings.push(`Driver ${driver.fullName || driver.name} is currently assigned to ${conflictingVehicle.busNumber} (Route ${conflictingVehicle.assignedRoute || 'Active'}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Trip Readiness Engine: Validates vehicle, route, driver, and battery safety margin
export function validateTripReadiness(vehicle = {}, route = {}, driver = {}) {
  const checks = [];
  let isReady = true;

  const veh = vehicle || {};
  const rt = route || {};
  const drv = driver || {};

  // 1. Vehicle Availability
  if (veh.status === 'MAINTENANCE' || veh.status === 'OFFLINE' || veh.status === 'RETIRED') {
    checks.push({ label: 'Vehicle Operating Status', passed: false, detail: `Asset is ${veh.status || 'Offline'}` });
  } else {
    checks.push({ label: 'Vehicle Operating Status', passed: true, detail: `${veh.status || 'Available'}` });
  }

  // 2. Battery Range vs Route Distance + 15km Safety Reserve
  const routeDistanceKm = rt.lengthKm || 35;
  const safetyReserveKm = 15;
  const requiredRangeKm = routeDistanceKm + safetyReserveKm;
  const availableRangeKm = veh.rangeKm || Math.round(((veh.batteryPct || 85) / 100) * 220);

  if (availableRangeKm < requiredRangeKm) {
    checks.push({
      label: 'Energy & Range Buffer',
      passed: false,
      detail: `Available: ${availableRangeKm} km (Buffer needed: ${requiredRangeKm} km)`
    });
  } else {
    checks.push({
      label: 'Energy & Range Buffer',
      passed: true,
      detail: `${availableRangeKm} km range covers route + buffer`
    });
  }

  // 3. Driver Rest & Availability
  if (!drv.id && !drv.name) {
    checks.push({ label: 'Driver Allocation', passed: false, detail: 'Select driver from roster' });
  } else if (drv.status === 'REST_VIOLATION') {
    checks.push({
      label: 'Driver Safety Rest Status',
      passed: false,
      detail: `${drv.fullName || drv.name} needs mandatory rest`
    });
  } else {
    checks.push({
      label: 'Driver Safety Rest Status',
      passed: true,
      detail: `${drv.fullName || drv.name} (Duty: ${drv.accumulatedHours || 4}h)`
    });
  }

  // 4. Compliance Documents
  const hasExpiredDoc = veh.compliance && Object.values(veh.compliance).some(d => calculateDocumentCompliance(d).status === 'EXPIRED');
  if (hasExpiredDoc) {
    checks.push({ label: 'Document Compliance', passed: false, detail: 'One or more certificates due for renewal' });
  } else {
    checks.push({ label: 'Document Compliance', passed: true, detail: 'RC, Insurance, and Fitness current' });
  }

  // 5. GPS Telemetry Online
  if (veh.gpsStatus === 'OFFLINE') {
    checks.push({ label: 'GPS Telemetry Feed', passed: false, detail: 'Signal idle' });
  } else {
    checks.push({ label: 'GPS Telemetry Feed', passed: true, detail: 'Online & connected' });
  }

  return {
    isReady: true, // Allow dispatch while displaying advisory verification checklist
    checks,
    requiredRangeKm,
    availableRangeKm
  };
}

// Predictive Maintenance Risk Scoring
export function calculatePredictiveMaintenanceRisk(vehicle) {
  let riskScore = 15; // baseline
  const reasons = [];

  // Odometer check
  const odo = vehicle.odometerKm || 50000;
  if (odo > 120000) {
    riskScore += 30;
    reasons.push('High cumulative mileage (>120,000 km)');
  } else if (odo > 80000) {
    riskScore += 15;
    reasons.push('Moderate cumulative mileage (>80,000 km)');
  }

  // Next service date check
  if (vehicle.nextServiceDate) {
    const days = Math.ceil((new Date(vehicle.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 3) {
      riskScore += 40;
      reasons.push(`Scheduled service due in ${days} days`);
    } else if (days <= 10) {
      riskScore += 20;
      reasons.push(`Scheduled service due in ${days} days`);
    }
  }

  // Battery health / thermal check
  if (vehicle.batteryPct <= 20) {
    riskScore += 25;
    reasons.push('Deep discharge cycle (<20% battery)');
  }

  let level = 'LOW';
  if (riskScore >= 65) level = 'HIGH';
  else if (riskScore >= 35) level = 'MEDIUM';

  return {
    score: Math.min(100, riskScore),
    level,
    reasons: reasons.length > 0 ? reasons : ['Normal operating parameters within tolerance']
  };
}

// Natural Language / Smart Query Parser
export function parseNaturalLanguageQuery(query = '', vehicles = []) {
  const q = query.trim().toLowerCase();
  if (!q) return { parsed: false, filters: null };

  const parsedFilters = {};

  // Check battery query
  const batteryMatch = q.match(/battery\s*(?:below|<|under|less than)\s*(\d+)/);
  if (batteryMatch) {
    const threshold = parseInt(batteryMatch[1], 10);
    parsedFilters.customFilter = (v) => (v.batteryPct || 0) < threshold;
    parsedFilters.description = `Battery < ${threshold}%`;
  }

  // Check maintenance query
  if (q.includes('maintenance') || q.includes('workshop') || q.includes('service')) {
    parsedFilters.status = 'MAINTENANCE';
    parsedFilters.description = 'Vehicles under maintenance';
  }

  // Check electric query
  if (q.includes('electric') || q.includes('ev')) {
    parsedFilters.fuelType = 'ELECTRIC';
    parsedFilters.description = 'Electric EV fleet';
  }

  // Check depot query
  if (q.includes('kashmere') || q.includes('isbt')) {
    parsedFilters.depot = 'Kashmere Gate ISBT';
  } else if (q.includes('anand vihar')) {
    parsedFilters.depot = 'Anand Vihar Hub';
  } else if (q.includes('rohini')) {
    parsedFilters.depot = 'Rohini Sector 14 Depot';
  } else if (q.includes('dwarka')) {
    parsedFilters.depot = 'Dwarka Sector 21 Depot';
  }

  // Check route query
  const routeMatch = q.match(/route\s*(\d+[a-z]?)/i);
  if (routeMatch) {
    parsedFilters.assignedRoute = routeMatch[1];
    parsedFilters.description = `Assigned to Route ${routeMatch[1]}`;
  }

  // Check expiring documents query
  if (q.includes('expir') || q.includes('document') || q.includes('fitness') || q.includes('puc')) {
    parsedFilters.customFilter = (v) => {
      if (!v.compliance) return false;
      return Object.values(v.compliance).some(d => {
        const c = calculateDocumentCompliance(d);
        return c.status === 'EXPIRING_SOON' || c.status === 'EXPIRED';
      });
    };
    parsedFilters.description = 'Vehicles with expiring/expired documents';
  }

  return {
    parsed: Object.keys(parsedFilters).length > 0,
    filters: parsedFilters
  };
}

// Format export payload (CSV / JSON)
export function generateFleetExport(vehicles = [], format = 'csv') {
  const rows = vehicles.map(v => ({
    "Asset ID": v.id,
    "Registration Plate": v.busNumber,
    "Vehicle Type": v.type,
    "Fuel / Powertrain": v.fuelType,
    "Seating Capacity": v.capacity,
    "Depot": v.depot || 'Kashmere Gate ISBT',
    "Assigned Route": v.assignedRoute || 'Unassigned',
    "Assigned Driver": v.assignedDriver || 'Unassigned',
    "Status": v.status,
    "Speed": `${v.speedKmH || 0} km/h`,
    "Battery / Fuel": `${v.batteryPct || 0}%`,
    "Estimated Range": `${v.rangeKm || 0} km`,
    "Odometer": `${v.odometerKm || 0} km`,
    "Next Service Date": v.nextServiceDate || 'N/A',
    "VIN / Chassis": v.vin || 'N/A',
    "GPS Status": v.gpsStatus || 'ONLINE'
  }));

  if (format === 'csv') {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]).join(',');
    const body = rows.map(r => Object.values(r).map(val => `"${val}"`).join(',')).join('\n');
    return `${headers}\n${body}`;
  }

  return JSON.stringify(rows, null, 2);
}
