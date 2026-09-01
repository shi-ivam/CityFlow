import os
from typing import List, Optional, Any, Dict
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .seed import seed_database
from .models import (
    DriverSummaryModel,
    DriverProfileModel,
    DriverAssignedRouteResponse,
    ShiftDurationResponse,
    FatigueResponse,
    NextShiftAllocationResponse,
    ShiftChangeRequestModel,
    ShiftChangeRequestCreate,
    ShiftChangeStatusUpdate,
    DriverCreate,
    DriverUpdate,
    DriverAssignmentRequest,
    VehicleModel,
    VehicleCreate,
    VehicleUpdate,
    VehicleAssignmentRequest,
    MaintenanceScheduleRequest,
    VehicleMaintenanceModel,
    RouteDetailModel,
    RouteCreateModel,
    RouteUpdateModel,
    HubModel,
    TripModel,
    TripCreate,
    DutyModel,
    DutyCreate,
    FallbackSolverRequest,
    FallbackSolverResponse,
    AdminDashboardMetricsResponse
)
from .services import driver_service, vehicle_service, route_service, duty_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event to guarantee SQLite tables are initialized and seeded on startup."""
    init_db()
    seed_database()
    yield

app = FastAPI(
    title="CityFlow Transit Operations & Driver Portal Backend",
    description="High-density transit telemetry, shift monitoring, spatial GIS route planning, fleet maintenance, and constraint solver API for CityFlow.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# 1. System Health
# ----------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "CityFlow Transit Engine",
        "database": "SQLite (cityflow.db)",
        "mode": "Multi-City Production Verified",
        "supportedCities": ["chennai", "delhi"]
    }

# ----------------------------------------------------
# 2. Driver Portal Endpoints
# ----------------------------------------------------
@app.get("/api/drivers", response_model=List[DriverSummaryModel])
def list_drivers():
    """List all MTC Chennai drivers with active vehicle and route summary for Driver Portal."""
    return driver_service.get_all_drivers()

@app.get("/api/drivers/{driver_id}", response_model=DriverProfileModel)
def get_driver(driver_id: str):
    """Get full profile details of a specific driver."""
    profile = driver_service.get_driver_profile(driver_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with ID {driver_id} not found."
        )
    return profile

@app.get("/api/drivers/{driver_id}/route", response_model=DriverAssignedRouteResponse)
def get_driver_assigned_route(driver_id: str):
    """Get assigned route geometry, stops sequence, and live bus telemetry."""
    data = driver_service.get_driver_assigned_route(driver_id)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route data for driver {driver_id} not found."
        )
    return data

@app.get("/api/drivers/{driver_id}/shift", response_model=ShiftDurationResponse)
def get_driver_shift_duration(driver_id: str):
    """Get dynamic real-time shift duration, elapsed time, and 8h duty compliance."""
    shift = driver_service.get_driver_shift_duration(driver_id)
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active shift for driver {driver_id} not found."
        )
    return shift

@app.get("/api/drivers/{driver_id}/fatigue", response_model=FatigueResponse)
def get_driver_fatigue(driver_id: str):
    """Compute real-time driver fatigue level and advisory recommendations."""
    fatigue = driver_service.get_driver_fatigue_level(driver_id)
    if not fatigue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fatigue evaluation unavailable for driver {driver_id}."
        )
    return fatigue

@app.get("/api/drivers/{driver_id}/next-shift", response_model=NextShiftAllocationResponse)
def get_driver_next_shift(driver_id: str):
    """Get next scheduled shift allocation and reporting depot details."""
    next_shift = driver_service.get_driver_next_shift(driver_id)
    if not next_shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Next shift allocation for driver {driver_id} not found."
        )
    return next_shift

@app.get("/api/drivers/{driver_id}/shift-change", response_model=List[ShiftChangeRequestModel])
def get_driver_shift_change_requests(driver_id: str):
    """Get all past and pending shift change requests for this driver."""
    return driver_service.get_driver_shift_change_requests(driver_id)

@app.post("/api/drivers/{driver_id}/shift-change", response_model=ShiftChangeRequestModel, status_code=status.HTTP_201_CREATED)
def submit_shift_change_request(driver_id: str, payload: ShiftChangeRequestCreate):
    """Submit a new shift change request persisted in SQLite."""
    try:
        return driver_service.create_shift_change_request(driver_id, payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# ----------------------------------------------------
# 3. Admin Driver Management Endpoints
# ----------------------------------------------------
@app.get("/api/admin/drivers")
def get_admin_drivers(city: Optional[str] = Query(None)):
    """List all drivers with admin workload and rest compliance metrics."""
    return driver_service.get_admin_drivers(city)

@app.post("/api/admin/drivers", status_code=status.HTTP_201_CREATED)
def create_admin_driver(payload: DriverCreate):
    """Register a new transit driver."""
    return driver_service.create_driver(payload)

@app.put("/api/admin/drivers/{driver_id}")
def update_admin_driver(driver_id: str, payload: DriverUpdate):
    """Update driver details."""
    updated = driver_service.update_driver(driver_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Driver {driver_id} not found.")
    return updated

@app.delete("/api/admin/drivers/{driver_id}")
def delete_admin_driver(driver_id: str):
    """Deactivate driver."""
    success = driver_service.deactivate_driver(driver_id)
    return {"success": success, "driverId": driver_id}

@app.post("/api/admin/drivers/{driver_id}/assign")
def assign_admin_driver(driver_id: str, payload: DriverAssignmentRequest):
    """Assign driver to bus/route/trip."""
    updated = driver_service.update_driver_assignment(driver_id, payload.busId, payload.routeId, payload.tripId)
    return updated

@app.put("/api/shift-change/{request_id}/status", response_model=ShiftChangeRequestModel)
def update_shift_change_status(request_id: str, payload: ShiftChangeStatusUpdate):
    """Approve or reject a driver shift change request."""
    updated = driver_service.update_shift_change_request_status(request_id, payload.status, payload.reviewerNotes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Shift change request {request_id} not found.")
    return updated

# ----------------------------------------------------
# 4. Vehicles / Fleet Management Endpoints
# ----------------------------------------------------
@app.get("/api/vehicles", response_model=List[VehicleModel])
def list_vehicles(
    city: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """List fleet buses with filtering and search."""
    return vehicle_service.get_all_vehicles(city, status, search)

@app.get("/api/vehicles/{vehicle_id}", response_model=VehicleModel)
def get_vehicle(vehicle_id: str):
    """Get single vehicle details."""
    v = vehicle_service.get_vehicle_by_id(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found.")
    return v

@app.post("/api/vehicles", response_model=VehicleModel, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate):
    """Add a new bus to the fleet."""
    return vehicle_service.create_vehicle(payload)

@app.put("/api/vehicles/{vehicle_id}", response_model=VehicleModel)
def update_vehicle(vehicle_id: str, payload: VehicleUpdate):
    """Update vehicle specifications."""
    v = vehicle_service.update_vehicle(vehicle_id, payload)
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found.")
    return v

@app.delete("/api/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: str):
    """Retire/delete vehicle from fleet."""
    success = vehicle_service.delete_vehicle(vehicle_id)
    return {"success": success, "vehicleId": vehicle_id}

@app.post("/api/vehicles/{vehicle_id}/assign", response_model=VehicleModel)
def assign_vehicle_route(vehicle_id: str, payload: VehicleAssignmentRequest):
    """Assign vehicle to route and driver."""
    v = vehicle_service.assign_vehicle(vehicle_id, payload.routeId, payload.driverId, payload.shiftTime)
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle {vehicle_id} not found.")
    return v

@app.post("/api/vehicles/{vehicle_id}/maintenance", response_model=VehicleMaintenanceModel, status_code=status.HTTP_201_CREATED)
def schedule_vehicle_maintenance(vehicle_id: str, payload: MaintenanceScheduleRequest):
    """Schedule vehicle workshop maintenance."""
    return vehicle_service.schedule_maintenance(
        vehicle_id, payload.maintenanceType, payload.scheduledDate, payload.notes or "", payload.priority or "MEDIUM"
    )

# ----------------------------------------------------
# 5. Routes & Hubs Endpoints
# ----------------------------------------------------
@app.get("/api/routes", response_model=List[RouteDetailModel])
def list_routes(city: Optional[str] = Query(None)):
    """List transit corridors with coordinate geometry and stop sequences."""
    return route_service.get_all_routes(city)

@app.get("/api/routes/{route_id}", response_model=RouteDetailModel)
def get_route(route_id: str):
    """Get single route details."""
    r = route_service.get_route_by_id(route_id)
    if not r:
        raise HTTPException(status_code=404, detail=f"Route {route_id} not found.")
    return r

@app.post("/api/routes", response_model=RouteDetailModel, status_code=status.HTTP_201_CREATED)
def create_route(payload: RouteCreateModel):
    """Create a new spatial transit route."""
    return route_service.create_route(payload)

@app.put("/api/routes/{route_id}", response_model=RouteDetailModel)
def update_route(route_id: str, payload: RouteUpdateModel):
    """Update route corridor properties."""
    r = route_service.update_route(route_id, payload)
    if not r:
        raise HTTPException(status_code=404, detail=f"Route {route_id} not found.")
    return r

@app.delete("/api/routes/{route_id}")
def delete_route(route_id: str):
    """Delete route."""
    success = route_service.delete_route(route_id)
    return {"success": success, "routeId": route_id}

@app.get("/api/hubs", response_model=List[HubModel])
def list_hubs(city: Optional[str] = Query(None)):
    """List major multimodal interchange hubs."""
    return route_service.get_all_hubs(city)

# ----------------------------------------------------
# 6. Scheduled Trips Endpoints
# ----------------------------------------------------
@app.get("/api/trips", response_model=List[TripModel])
def list_trips(city: Optional[str] = Query(None)):
    """List scheduled trips across routes."""
    return duty_service.get_all_trips(city)

@app.post("/api/trips", response_model=TripModel, status_code=status.HTTP_201_CREATED)
def schedule_trip(payload: TripCreate):
    """Schedule a new trip on a corridor."""
    return duty_service.create_trip(payload)

# ----------------------------------------------------
# 7. Duties & Fallback Solver Endpoints
# ----------------------------------------------------
@app.get("/api/duties", response_model=List[DutyModel])
def list_duties(city: Optional[str] = Query(None)):
    """List master duty rosters and Gantt timeline records."""
    return duty_service.get_all_duties(city)

@app.post("/api/duties", response_model=DutyModel, status_code=status.HTTP_201_CREATED)
def save_duty(payload: DutyCreate):
    """Create or update a crew duty assignment."""
    return duty_service.create_or_update_duty(payload)

@app.post("/api/duties/solve-conflicts", response_model=FallbackSolverResponse)
def solve_conflicts(payload: FallbackSolverRequest):
    """Execute automated 3-tier constraint solver for rest violations."""
    return duty_service.solve_duty_conflicts(payload.dutyId, payload.strategy or "AUTO")

# ----------------------------------------------------
# 8. Fleet & Operational KPI Metrics
# ----------------------------------------------------
@app.get("/api/admin/metrics", response_model=AdminDashboardMetricsResponse)
def get_admin_metrics(city: Optional[str] = Query(None)):
    """Aggregate live operational metrics for Admin Dashboard and KPIs."""
    vehicles = vehicle_service.get_all_vehicles(city)
    drivers = driver_service.get_admin_drivers(city)
    routes = route_service.get_all_routes(city)

    active_buses = sum(1 for v in vehicles if v.status == "IN_SERVICE")
    active_drivers = sum(1 for d in drivers if d["status"] in ("ASSIGNED", "ON_DUTY", "ACTIVE"))
    conflicts = sum(1 for d in drivers if d["complianceStatus"] == "REST_VIOLATION")

    return AdminDashboardMetricsResponse(
        activeBuses=active_buses,
        totalBuses=len(vehicles),
        activeDrivers=active_drivers,
        totalDrivers=len(drivers),
        activeRoutes=len(routes),
        totalRoutes=len(routes),
        activeConflictsCount=conflicts,
        crewUtilization=87.5 if len(drivers) > 0 else 0.0,
        networkCoverageKm=412.0,
        deadheadRatio=3.2
    )

