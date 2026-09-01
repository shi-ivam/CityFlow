import { TransitRoute, Coordinates, Stop } from '../types/transit';

export interface DriverSummary {
  driverId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  depot: string;
  status: string;
  experienceYears: number;
  assignedBusId: string;
  assignedVehicleNumber: string;
  assignedRouteId: string;
  assignedRouteCode: string;
  assignedRouteName: string;
}

export interface DriverProfile {
  driverId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  depot: string;
  status: string;
  experienceYears: number;
  assignedBusId: string;
  assignedVehicleNumber: string;
  assignedRouteId: string;
  assignedRouteCode: string;
  assignedRouteName: string;
}

export interface DriverTelemetry {
  driverId: string;
  busId: string;
  vehicleNumber: string;
  routeId: string;
  currentCoord: Coordinates;
  heading: number;
  speedKmH: number;
  occupancyPercent: number;
  status: string;
  delayMinutes: number;
  nextStopName: string;
  nextStopEtaMinutes: number;
  distanceToNextStopM: number;
  progressAlongRoute: number;
  direction: number;
  lastUpdated: string;
}

export interface DriverAssignedRouteResponse {
  driver: DriverProfile;
  route: TransitRoute;
  telemetry: DriverTelemetry;
}

export interface ShiftDurationResponse {
  shiftId: string;
  driverId: string;
  driverName: string;
  shiftType: string;
  startTime: string;
  plannedEndTime: string;
  elapsedSeconds: number;
  elapsedFormatted: string;
  remainingSeconds: number;
  remainingFormatted: string;
  shiftProgressPercent: number;
  maxShiftLimitHours: number;
  isOvertime: boolean;
  breakDurationMinutes: number;
  continuousDriveMinutes: number;
  status: string;
}

export interface FatigueFactors {
  driveDurationHours: number;
  driveStrainPoints: number;
  continuousDrivingMinutes: number;
  continuousDrivingStrainPoints: number;
  breakMinutes: number;
  restReliefPoints: number;
  circadianFactorName: string;
  circadianStrainPoints: number;
  delayMinutes: number;
  delayStrainPoints: number;
}

export interface FatigueResponse {
  driverId: string;
  fatigueScore: number;
  fatigueBand: 'OPTIMAL' | 'MODERATE' | 'HIGH';
  statusText: string;
  factors: FatigueFactors;
  safetyAdvisory: string;
  recommendedAction: string;
  maxDriveWithoutBreakRemainingMinutes: number;
}

export interface NextShiftAllocationResponse {
  allocationId: string;
  driverId: string;
  shiftDate: string;
  shiftDateFormatted: string;
  shiftType: string;
  shiftWindowFormatted: string;
  startTime: string;
  endTime: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  vehicleNumber: string;
  busId: string;
  reportingDepot: string;
  reportingBay: string;
  status: string;
}

export interface ShiftChangeRequestPayload {
  requestedShiftDate: string;
  requestedShiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'REST_OFF';
  reasonCategory: 'MEDICAL' | 'PERSONAL' | 'FATIGUE_PREVENTION' | 'FAMILY_EMERGENCY' | 'ROSTER_PREFERENCE';
  reasonDetails: string;
  targetDriverId?: string | null;
}

export interface ShiftChangeRequest {
  requestId: string;
  driverId: string;
  driverName: string;
  currentShiftId: string | null;
  requestedShiftDate: string;
  requestedShiftType: string;
  reasonCategory: string;
  reasonDetails: string;
  targetDriverId: string | null;
  targetDriverName: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = '/api';

export async function fetchDrivers(): Promise<DriverSummary[]> {
  const res = await fetch(`${API_BASE}/drivers`);
  if (!res.ok) throw new Error(`Failed to fetch drivers (${res.status})`);
  return res.json();
}

export async function fetchDriverProfile(driverId: string): Promise<DriverProfile> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}`);
  if (!res.ok) throw new Error(`Failed to fetch driver ${driverId} (${res.status})`);
  return res.json();
}

export async function fetchDriverAssignedRoute(driverId: string): Promise<DriverAssignedRouteResponse> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/route`);
  if (!res.ok) throw new Error(`Failed to fetch assigned route for ${driverId} (${res.status})`);
  return res.json();
}

export async function fetchDriverShift(driverId: string): Promise<ShiftDurationResponse> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/shift`);
  if (!res.ok) throw new Error(`Failed to fetch shift for ${driverId} (${res.status})`);
  return res.json();
}

export async function fetchDriverFatigue(driverId: string): Promise<FatigueResponse> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/fatigue`);
  if (!res.ok) throw new Error(`Failed to fetch fatigue for ${driverId} (${res.status})`);
  return res.json();
}

export async function fetchDriverNextShift(driverId: string): Promise<NextShiftAllocationResponse> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/next-shift`);
  if (!res.ok) throw new Error(`Failed to fetch next shift for ${driverId} (${res.status})`);
  return res.json();
}

export async function fetchShiftChangeRequests(driverId: string): Promise<ShiftChangeRequest[]> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/shift-change`);
  if (!res.ok) throw new Error(`Failed to fetch shift change requests for ${driverId} (${res.status})`);
  return res.json();
}

export async function submitShiftChangeRequest(
  driverId: string,
  payload: ShiftChangeRequestPayload
): Promise<ShiftChangeRequest> {
  const res = await fetch(`${API_BASE}/drivers/${driverId}/shift-change`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to submit shift change request' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
