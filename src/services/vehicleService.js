/**
 * vehicleService.js
 * Centralized business logic and data service for CityFlow Vehicle Fleet Operations.
 * Handles validation, state transitions, conflict checks, compliance calculations, and audit logging.
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

// Calculate fleet summary statistics dynamically
export function calculateFleetMetrics(busFleet = []) {
  const total = busFleet.length;
  const inService = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const standby = busFleet.filter(b => b.status === 'STANDBY_READY' || b.status === 'AVAILABLE').length;
  const maintenance = busFleet.filter(b => b.status === 'MAINTENANCE').length;
  const offline = busFleet.filter(b => b.status === 'OFFLINE').length;
  const retired = busFleet.filter(b => b.status === 'RETIRED').length;
  
  // Moving assets
  const moving = busFleet.filter(b => b.status === 'IN_SERVICE' && (b.speedKmH > 0)).length;
  
  // Maintenance due within 15 days
  const maintenanceDueSoon = busFleet.filter(b => {
    if (!b.nextServiceDate) return false;
    const days = Math.ceil((new Date(b.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 15;
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
    standby,
    maintenance,
    offline,
    retired,
    moving,
    maintenanceDueSoon,
    complianceAlerts,
    utilizationPct,
    healthPct
  };
}

// Validate vehicle assignment against driver and maintenance conflicts
export function validateVehicleAssignment(vehicle, driver, shiftTime, allVehicles = []) {
  const errors = [];
  const warnings = [];

  // 1. Vehicle Maintenance Check
  if (vehicle.status === 'MAINTENANCE') {
    errors.push(`Vehicle ${vehicle.busNumber} is under active maintenance and cannot be dispatched to an active route.`);
  }

  // 2. Driver Rest Compliance Check
  if (driver) {
    if (driver.status === 'REST_VIOLATION' || driver.accumulatedHours >= 8) {
      warnings.push(`Driver ${driver.fullName || driver.name} has logged ${driver.accumulatedHours || 8}h of duty. Mandatory 11-hour continuous rest period is required under MTC/DTC transit safety regulations.`);
    }

    // 3. Driver Double-Booking Check
    const conflictingVehicle = allVehicles.find(v => 
      v.id !== vehicle.id && 
      v.driverId === driver.id && 
      v.status === 'IN_SERVICE'
    );
    if (conflictingVehicle) {
      warnings.push(`Driver ${driver.fullName || driver.name} is currently assigned to ${conflictingVehicle.busNumber} (Route ${conflictingVehicle.assignedRoute || 'Active'}). Reassigning will detach previous duty.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Format export payload
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
