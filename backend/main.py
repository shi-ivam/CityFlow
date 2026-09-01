import os
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
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
)
from .services import driver_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event to guarantee SQLite tables are initialized and seeded on startup."""
    init_db()
    seed_database()
    yield

app = FastAPI(
    title="CityFlow Driver Portal Backend",
    description="High-density transit telemetry, shift monitoring, fatigue analysis and roster change API for MTC Chennai bus drivers.",
    version="1.0.0",
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

@app.get("/api/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "CityFlow Transit Engine",
        "database": "SQLite (cityflow.db)",
        "mode": "Production Verified"
    }

@app.get("/api/drivers", response_model=List[DriverSummaryModel])
def list_drivers():
    """List all 10 MTC drivers with active vehicle and route summary."""
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
