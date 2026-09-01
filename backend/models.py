from typing import List, Optional, Tuple, Literal
from pydantic import BaseModel, Field

# Base Coordinate
Coordinates = Tuple[float, float] # [lng, lat]

class StopModel(BaseModel):
    id: str
    name: str
    code: str
    coordinates: List[float]
    isHub: Optional[bool] = False

class RouteDetailModel(BaseModel):
    id: str
    code: str
    name: str
    origin: str
    destination: str
    via: str
    category: str
    frequencyMinutes: int
    totalDistanceKm: float
    activeBusCount: int
    stops: List[StopModel]
    coordinates: List[List[float]]

class DriverSummaryModel(BaseModel):
    driverId: str
    name: str
    licenseNumber: str
    phone: str
    depot: str
    status: str
    experienceYears: int
    assignedBusId: str
    assignedVehicleNumber: str
    assignedRouteId: str
    assignedRouteCode: str
    assignedRouteName: str

class DriverProfileModel(BaseModel):
    driverId: str
    name: str
    licenseNumber: str
    phone: str
    depot: str
    status: str
    experienceYears: int
    assignedBusId: str
    assignedVehicleNumber: str
    assignedRouteId: str
    assignedRouteCode: str
    assignedRouteName: str

class DriverTelemetryModel(BaseModel):
    driverId: str
    busId: str
    vehicleNumber: str
    routeId: str
    currentCoord: List[float] # [lng, lat]
    heading: float
    speedKmH: float
    occupancyPercent: int
    status: str
    delayMinutes: float
    nextStopName: str
    nextStopEtaMinutes: float
    distanceToNextStopM: int
    progressAlongRoute: float
    direction: int
    lastUpdated: str

class DriverAssignedRouteResponse(BaseModel):
    driver: DriverProfileModel
    route: RouteDetailModel
    telemetry: DriverTelemetryModel

class ShiftDurationResponse(BaseModel):
    shiftId: str
    driverId: str
    driverName: str
    shiftType: str
    startTime: str
    plannedEndTime: str
    elapsedSeconds: int
    elapsedFormatted: str # "05:32:18"
    remainingSeconds: int
    remainingFormatted: str # "02:27:42"
    shiftProgressPercent: float
    maxShiftLimitHours: float = 8.0
    isOvertime: bool
    breakDurationMinutes: int
    continuousDriveMinutes: int
    status: str

class FatigueFactorBreakdown(BaseModel):
    driveDurationHours: float
    driveStrainPoints: float
    continuousDrivingMinutes: int
    continuousDrivingStrainPoints: float
    breakMinutes: int
    restReliefPoints: float
    circadianFactorName: str
    circadianStrainPoints: float
    delayMinutes: float
    delayStrainPoints: float

class FatigueResponse(BaseModel):
    driverId: str
    fatigueScore: int # 0 to 100
    fatigueBand: Literal["OPTIMAL", "MODERATE", "HIGH"]
    statusText: str
    factors: FatigueFactorBreakdown
    safetyAdvisory: str
    recommendedAction: str
    maxDriveWithoutBreakRemainingMinutes: int

class NextShiftAllocationResponse(BaseModel):
    allocationId: str
    driverId: str
    shiftDate: str # "2026-09-02"
    shiftDateFormatted: str # "Tomorrow • 02 Sep 2026"
    shiftType: str # "GENERAL"
    shiftWindowFormatted: str # "14:00 - 22:00"
    startTime: str
    endTime: str
    routeId: str
    routeCode: str
    routeName: str
    vehicleNumber: str
    busId: str
    reportingDepot: str
    reportingBay: str
    status: str

class ShiftChangeRequestCreate(BaseModel):
    requestedShiftDate: str
    requestedShiftType: Literal["MORNING", "AFTERNOON", "NIGHT", "REST_OFF"]
    reasonCategory: Literal["MEDICAL", "PERSONAL", "FATIGUE_PREVENTION", "FAMILY_EMERGENCY", "ROSTER_PREFERENCE"]
    reasonDetails: str
    targetDriverId: Optional[str] = None

class ShiftChangeRequestModel(BaseModel):
    requestId: str
    driverId: str
    driverName: str
    currentShiftId: Optional[str]
    requestedShiftDate: str
    requestedShiftType: str
    reasonCategory: str
    reasonDetails: str
    targetDriverId: Optional[str]
    targetDriverName: Optional[str]
    status: Literal["PENDING", "APPROVED", "REJECTED"]
    reviewerNotes: Optional[str]
    createdAt: str
    updatedAt: str

class ShiftChangeStatusUpdate(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
    reviewerNotes: Optional[str] = None

# Admin & Fleet Models
class HubModel(BaseModel):
    id: str
    city: str = "chennai"
    name: str
    code: str
    description: Optional[str] = None
    bayCount: int = 8
    activeTransfers: int = 3
    coordinates: List[float] # [lng, lat]

class VehicleModel(BaseModel):
    id: str # bus-101 / bus-chn-101
    busNumber: str # TN 01 N 9401 / DL 1PC 4821
    regNumber: Optional[str] = None
    model: str
    type: str = "Electric AC City Bus"
    fuelType: str = "Electric"
    capacity: int = 65
    status: str = "IN_SERVICE"
    batteryPct: float = 88.0
    rangeKm: float = 160.0
    mileageKm: float = 45000.0
    odometerKm: float = 45000.0
    depot: str = "CMBT Central Depot"
    assignedRoute: Optional[str] = None
    assignedDriver: Optional[str] = None
    speedKmH: float = 0.0
    nextServiceDate: Optional[str] = None
    lastInspectionDate: Optional[str] = None
    vin: Optional[str] = None
    compliance: Optional[dict] = None
    city: str = "chennai"

class VehicleCreate(BaseModel):
    id: Optional[str] = None
    busNumber: str
    regNumber: Optional[str] = None
    model: str = "Ashok Leyland Electric Metro"
    type: str = "Electric AC City Bus"
    fuelType: str = "Electric"
    capacity: int = 65
    status: str = "IN_SERVICE"
    batteryPct: float = 90.0
    rangeKm: float = 180.0
    depot: str = "CMBT Central Depot"
    assignedRoute: Optional[str] = None
    assignedDriver: Optional[str] = None
    nextServiceDate: Optional[str] = None
    vin: Optional[str] = None
    city: str = "chennai"

class VehicleUpdate(BaseModel):
    busNumber: Optional[str] = None
    model: Optional[str] = None
    type: Optional[str] = None
    fuelType: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    batteryPct: Optional[float] = None
    rangeKm: Optional[float] = None
    depot: Optional[str] = None
    assignedRoute: Optional[str] = None
    assignedDriver: Optional[str] = None
    nextServiceDate: Optional[str] = None
    vin: Optional[str] = None

class VehicleAssignmentRequest(BaseModel):
    vehicleId: str
    routeId: Optional[str] = None
    driverId: Optional[str] = None
    shiftTime: Optional[str] = None

class MaintenanceScheduleRequest(BaseModel):
    vehicleId: str
    maintenanceType: str
    scheduledDate: str
    notes: Optional[str] = ""
    priority: Optional[str] = "MEDIUM"

class VehicleMaintenanceModel(BaseModel):
    id: str
    busId: str
    type: str
    description: str
    scheduledDate: str
    status: str = "PENDING"
    cost: float = 0.0
    technician: str = "Depot Workshop Team"
    createdAt: str

class DriverAdminModel(BaseModel):
    id: str # DRV-7402
    name: str
    fullName: Optional[str] = None
    badgeNumber: Optional[str] = None
    licenseNumber: str
    phone: str
    depot: str
    status: str = "AVAILABLE"
    experienceYears: int = 5
    isStandby: bool = False
    accumulatedHours: float = 4.5
    weeklyDrivingHours: float = 24.0
    assignedBus: Optional[str] = None
    assignedRoute: Optional[str] = None
    city: str = "chennai"
    violationsCount: int = 0
    complianceStatus: str = "RESTING_COMPLIANT"

class DriverCreate(BaseModel):
    name: str
    badgeNumber: Optional[str] = None
    licenseNumber: str
    phone: str
    depot: str
    status: str = "AVAILABLE"
    experienceYears: int = 5
    city: str = "chennai"
    isStandby: bool = False

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    badgeNumber: Optional[str] = None
    licenseNumber: Optional[str] = None
    phone: Optional[str] = None
    depot: Optional[str] = None
    status: Optional[str] = None
    experienceYears: Optional[int] = None
    isStandby: Optional[bool] = None
    assignedBus: Optional[str] = None
    assignedRoute: Optional[str] = None

class DriverAssignmentRequest(BaseModel):
    driverId: str
    busId: Optional[str] = None
    routeId: Optional[str] = None
    tripId: Optional[str] = None

class RouteCreateModel(BaseModel):
    id: str
    code: str
    name: str
    origin: str
    destination: str
    via: str
    category: str = "High-Density Corridor"
    color: str = "#2563eb"
    frequencyMinutes: int = 10
    totalDistanceKm: float = 20.0
    activeBusCount: int = 10
    bufferMeters: int = 50
    operatingHours: str = "05:00 - 23:30 IST"
    city: str = "chennai"
    stops: List[StopModel]
    coordinates: List[List[float]]

class RouteUpdateModel(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    via: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    frequencyMinutes: Optional[int] = None
    totalDistanceKm: Optional[float] = None
    bufferMeters: Optional[int] = None
    operatingHours: Optional[str] = None

class TripModel(BaseModel):
    id: str
    city: str = "chennai"
    routeId: str
    routeCode: str
    departureTime: str
    arrivalTime: str
    originHub: str
    destHub: str
    assignedBusId: Optional[str] = None
    assignedDriverId: Optional[str] = None
    status: str = "SCHEDULED"
    tripDirection: int = 1

class TripCreate(BaseModel):
    id: Optional[str] = None
    city: str = "chennai"
    routeId: str
    routeCode: str
    departureTime: str
    arrivalTime: str
    originHub: str
    destHub: str
    assignedBusId: Optional[str] = None
    assignedDriverId: Optional[str] = None
    status: str = "SCHEDULED"
    tripDirection: int = 1

class DutyModel(BaseModel):
    id: str
    city: str = "chennai"
    dutyCode: str
    dutyType: str = "LINKED"
    crewId: str
    busId: str
    routeId: str
    startTime: str
    endTime: str
    mandatoryRestEnd: str
    status: str = "ACTIVE_SCHEDULED"
    resolvedViaTier: Optional[int] = None
    notes: Optional[str] = None

class DutyCreate(BaseModel):
    dutyCode: str
    dutyType: str = "LINKED"
    crewId: str
    busId: str
    routeId: str
    startTime: str
    endTime: str
    mandatoryRestEnd: str
    status: str = "ACTIVE_SCHEDULED"
    notes: Optional[str] = None
    city: str = "chennai"

class FallbackSolverRequest(BaseModel):
    dutyId: str
    strategy: Optional[Literal["TIER_1", "TIER_2", "TIER_3", "AUTO"]] = "AUTO"

class FallbackSolverResponse(BaseModel):
    success: bool
    duty: DutyModel
    message: str
    resolvedViaTier: int

class AdminDashboardMetricsResponse(BaseModel):
    activeBuses: int
    totalBuses: int
    activeDrivers: int
    totalDrivers: int
    activeRoutes: int
    totalRoutes: int
    activeConflictsCount: int
    crewUtilization: float
    networkCoverageKm: float
    deadheadRatio: float

