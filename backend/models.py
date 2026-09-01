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
