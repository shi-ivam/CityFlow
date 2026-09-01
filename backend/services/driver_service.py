import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..models import (
    DriverSummaryModel,
    DriverProfileModel,
    DriverTelemetryModel,
    RouteDetailModel,
    StopModel,
    DriverAssignedRouteResponse,
    ShiftDurationResponse,
    FatigueResponse,
    FatigueFactorBreakdown,
    NextShiftAllocationResponse,
    ShiftChangeRequestModel,
    ShiftChangeRequestCreate,
)

def get_all_drivers() -> List[DriverSummaryModel]:
    """Retrieve all drivers with their assigned vehicle and route details."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT 
            d.driver_id, d.name, d.license_number, d.phone, d.depot, d.status, d.experience_years,
            v.bus_id as assigned_bus_id, v.vehicle_number as assigned_vehicle_number,
            r.id as assigned_route_id, r.code as assigned_route_code, r.name as assigned_route_name
        FROM drivers d
        JOIN driver_telemetry t ON d.driver_id = t.driver_id
        JOIN vehicles v ON t.vehicle_number = v.vehicle_number
        JOIN routes r ON t.route_id = r.id
        ORDER BY d.driver_id ASC
        """)
        rows = cursor.fetchall()
        
        result = []
        for row in rows:
            result.append(DriverSummaryModel(
                driverId=row["driver_id"],
                name=row["name"],
                licenseNumber=row["license_number"],
                phone=row["phone"],
                depot=row["depot"],
                status=row["status"],
                experienceYears=row["experience_years"],
                assignedBusId=row["assigned_bus_id"],
                assignedVehicleNumber=row["assigned_vehicle_number"],
                assignedRouteId=row["assigned_route_id"],
                assignedRouteCode=row["assigned_route_code"],
                assignedRouteName=row["assigned_route_name"]
            ))
        return result

def get_driver_profile(driver_id: str) -> Optional[DriverProfileModel]:
    """Retrieve full profile for a given driver."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT 
            d.driver_id, d.name, d.license_number, d.phone, d.depot, d.status, d.experience_years,
            v.bus_id as assigned_bus_id, v.vehicle_number as assigned_vehicle_number,
            r.id as assigned_route_id, r.code as assigned_route_code, r.name as assigned_route_name
        FROM drivers d
        JOIN driver_telemetry t ON d.driver_id = t.driver_id
        JOIN vehicles v ON t.vehicle_number = v.vehicle_number
        JOIN routes r ON t.route_id = r.id
        WHERE d.driver_id = ?
        """, (driver_id,))
        row = cursor.fetchone()
        if not row:
            return None
        
        return DriverProfileModel(
            driverId=row["driver_id"],
            name=row["name"],
            licenseNumber=row["license_number"],
            phone=row["phone"],
            depot=row["depot"],
            status=row["status"],
            experienceYears=row["experience_years"],
            assignedBusId=row["assigned_bus_id"],
            assignedVehicleNumber=row["assigned_vehicle_number"],
            assignedRouteId=row["assigned_route_id"],
            assignedRouteCode=row["assigned_route_code"],
            assignedRouteName=row["assigned_route_name"]
        )

def get_driver_assigned_route(driver_id: str) -> Optional[DriverAssignedRouteResponse]:
    """Retrieve the driver's own route geometry, stops, and live telemetry."""
    profile = get_driver_profile(driver_id)
    if not profile:
        return None

    with get_db() as conn:
        cursor = conn.cursor()
        
        # Route
        cursor.execute("SELECT * FROM routes WHERE id = ?", (profile.assignedRouteId,))
        route_row = cursor.fetchone()
        if not route_row:
            return None

        stops_raw = json.loads(route_row["stops_json"])
        stops = [
            StopModel(
                id=s["id"],
                name=s["name"],
                code=s["code"],
                coordinates=s["coordinates"],
                isHub=s.get("isHub", False)
            )
            for s in stops_raw
        ]

        route_model = RouteDetailModel(
            id=route_row["id"],
            code=route_row["code"],
            name=route_row["name"],
            origin=route_row["origin"],
            destination=route_row["destination"],
            via=route_row["via"],
            category=route_row["category"],
            frequencyMinutes=route_row["frequency_minutes"],
            totalDistanceKm=route_row["total_distance_km"],
            activeBusCount=route_row["active_bus_count"],
            stops=stops,
            coordinates=json.loads(route_row["coordinates_json"])
        )

        # Telemetry
        cursor.execute("SELECT * FROM driver_telemetry WHERE driver_id = ?", (driver_id,))
        tel_row = cursor.fetchone()
        if not tel_row:
            return None

        telemetry_model = DriverTelemetryModel(
            driverId=tel_row["driver_id"],
            busId=tel_row["bus_id"],
            vehicleNumber=tel_row["vehicle_number"],
            routeId=tel_row["route_id"],
            currentCoord=[tel_row["current_lng"], tel_row["current_lat"]],
            heading=tel_row["heading"],
            speedKmH=tel_row["speed_kmh"],
            occupancyPercent=tel_row["occupancy_percent"],
            status=tel_row["status"],
            delayMinutes=tel_row["delay_minutes"],
            nextStopName=tel_row["next_stop_name"],
            nextStopEtaMinutes=tel_row["next_stop_eta_minutes"],
            distanceToNextStopM=tel_row["distance_to_next_stop_m"],
            progressAlongRoute=tel_row["progress_along_route"],
            direction=tel_row["direction"],
            lastUpdated=tel_row["last_updated"]
        )

        return DriverAssignedRouteResponse(
            driver=profile,
            route=route_model,
            telemetry=telemetry_model
        )

def get_driver_shift_duration(driver_id: str) -> Optional[ShiftDurationResponse]:
    """Calculate real-time shift duration and duty compliance."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT s.*, d.name as driver_name
        FROM active_shifts s
        JOIN drivers d ON s.driver_id = d.driver_id
        WHERE s.driver_id = ? AND s.status = 'ACTIVE'
        ORDER BY s.start_time DESC LIMIT 1
        """, (driver_id,))
        row = cursor.fetchone()
        if not row:
            return None

        start_dt = datetime.fromisoformat(row["start_time"])
        planned_end_dt = datetime.fromisoformat(row["planned_end_time"])
        now_dt = datetime.now()

        elapsed_seconds = max(0, int((now_dt - start_dt).total_seconds()))
        planned_total_seconds = max(1, int((planned_end_dt - start_dt).total_seconds()))
        remaining_seconds = max(0, int((planned_end_dt - now_dt).total_seconds()))

        hours = elapsed_seconds // 3600
        mins = (elapsed_seconds % 3600) // 60
        secs = elapsed_seconds % 60
        elapsed_formatted = f"{hours:02d}:{mins:02d}:{secs:02d}"

        rem_hours = remaining_seconds // 3600
        rem_mins = (remaining_seconds % 3600) // 60
        rem_secs = remaining_seconds % 60
        remaining_formatted = f"{rem_hours:02d}:{rem_mins:02d}:{rem_secs:02d}"

        progress_percent = min(100.0, round((elapsed_seconds / planned_total_seconds) * 100, 1))
        is_overtime = elapsed_seconds > (8 * 3600)

        return ShiftDurationResponse(
            shiftId=row["shift_id"],
            driverId=row["driver_id"],
            driverName=row["driver_name"],
            shiftType=row["shift_type"],
            startTime=row["start_time"],
            plannedEndTime=row["planned_end_time"],
            elapsedSeconds=elapsed_seconds,
            elapsedFormatted=elapsed_formatted,
            remainingSeconds=remaining_seconds,
            remainingFormatted=remaining_formatted,
            shiftProgressPercent=progress_percent,
            maxShiftLimitHours=8.0,
            isOvertime=is_overtime,
            breakDurationMinutes=row["break_duration_minutes"],
            continuousDriveMinutes=row["continuous_drive_minutes"],
            status=row["status"]
        )

def get_driver_fatigue_level(driver_id: str) -> Optional[FatigueResponse]:
    """Compute deterministic algorithmic fatigue telemetry."""
    shift = get_driver_shift_duration(driver_id)
    if not shift:
        return None

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT delay_minutes FROM driver_telemetry WHERE driver_id = ?", (driver_id,))
        tel_row = cursor.fetchone()
        delay_mins = tel_row["delay_minutes"] if tel_row else 0.0

    drive_hours = shift.elapsedSeconds / 3600.0
    drive_strain = round((drive_hours / 8.0) * 40.0, 1) # up to 40 pts

    cont_mins = shift.continuousDriveMinutes
    cont_strain = round(max(0.0, (cont_mins - 120) / 60.0) * 20.0, 1) # penalty after 2h

    break_mins = shift.breakDurationMinutes
    rest_relief = round((break_mins / 45.0) * 15.0, 1) # up to 15 pts mitigation

    now_hour = datetime.now().hour
    if 22 <= now_hour or now_hour < 6:
        circadian_name = "Night Shift Circadian Stress"
        circadian_points = 15.0
    elif 6 <= now_hour < 8:
        circadian_name = "Early Dawn Transition"
        circadian_points = 8.0
    else:
        circadian_name = "Daylight Normal"
        circadian_points = 0.0

    delay_strain = round(min(15.0, max(0.0, delay_mins * 2.5)), 1)

    raw_score = drive_strain + cont_strain - rest_relief + circadian_points + delay_strain
    fatigue_score = int(min(100, max(0, round(raw_score))))

    if fatigue_score <= 40:
        band = "OPTIMAL"
        status_text = "NORMAL - DUTY COMPLIANT"
        advisory = "Driver telemetry indicates normal focus and circadian balance. Continue standard schedule."
        action = "Next mandatory break in ~90 minutes."
    elif fatigue_score <= 70:
        band = "MODERATE"
        status_text = "MODERATE - MONITORED"
        advisory = "Elevated continuous drive time detected. Schedule short rest interval at terminus."
        action = "Recommended 15-minute hydration & rest pause at next terminal turnaround."
    else:
        band = "HIGH"
        status_text = "CRITICAL - REST REQUIRED"
        advisory = "Fatigue threshold exceeded. Immediate duty handover or extended depot break required."
        action = "Mandatory 30-minute relief handover protocol before next trip commencement."

    max_continuous_remaining = max(0, 180 - cont_mins)

    return FatigueResponse(
        driverId=driver_id,
        fatigueScore=fatigue_score,
        fatigueBand=band,
        statusText=status_text,
        factors=FatigueFactorBreakdown(
            driveDurationHours=round(drive_hours, 2),
            driveStrainPoints=drive_strain,
            continuousDrivingMinutes=cont_mins,
            continuousDrivingStrainPoints=cont_strain,
            breakMinutes=break_mins,
            restReliefPoints=rest_relief,
            circadianFactorName=circadian_name,
            circadianStrainPoints=circadian_points,
            delayMinutes=delay_mins,
            delayStrainPoints=delay_strain
        ),
        safetyAdvisory=advisory,
        recommendedAction=action,
        maxDriveWithoutBreakRemainingMinutes=max_continuous_remaining
    )

def get_driver_next_shift(driver_id: str) -> Optional[NextShiftAllocationResponse]:
    """Retrieve the next allocated shift for the driver."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT 
            ns.*, r.code as route_code, r.name as route_name, v.bus_id
        FROM next_shifts ns
        JOIN routes r ON ns.route_id = r.id
        JOIN vehicles v ON ns.vehicle_number = v.vehicle_number
        WHERE ns.driver_id = ?
        ORDER BY ns.shift_date ASC LIMIT 1
        """, (driver_id,))
        row = cursor.fetchone()
        if not row:
            return None

        # Format date nicely e.g. "Tomorrow • 02 Sep 2026"
        shift_d = datetime.strptime(row["shift_date"], "%Y-%m-%d")
        now_d = datetime.now().date()
        target_d = shift_d.date()
        
        if target_d == now_d + timedelta(days=1):
            date_prefix = "Tomorrow"
        elif target_d == now_d:
            date_prefix = "Today"
        else:
            date_prefix = shift_d.strftime("%A")
            
        formatted_date = f"{date_prefix} • {shift_d.strftime('%d %b %Y')}"
        window_fmt = f"{row['start_time']} - {row['end_time']}"

        depot_text = row["reporting_depot"]
        bay_part = "Bay 1"
        if "(" in depot_text and ")" in depot_text:
            bay_part = depot_text[depot_text.find("(")+1:depot_text.find(")")]
            depot_text = depot_text[:depot_text.find("(")].strip()

        return NextShiftAllocationResponse(
            allocationId=row["allocation_id"],
            driverId=row["driver_id"],
            shiftDate=row["shift_date"],
            shiftDateFormatted=formatted_date,
            shiftType=row["shift_type"],
            shiftWindowFormatted=window_fmt,
            startTime=row["start_time"],
            endTime=row["end_time"],
            routeId=row["route_id"],
            routeCode=row["route_code"],
            routeName=row["route_name"],
            vehicleNumber=row["vehicle_number"],
            busId=row["bus_id"],
            reportingDepot=depot_text,
            reportingBay=bay_part,
            status=row["status"]
        )

def get_driver_shift_change_requests(driver_id: str) -> List[ShiftChangeRequestModel]:
    """Retrieve all shift change requests for this driver."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT 
            r.*, d.name as driver_name, td.name as target_driver_name
        FROM shift_change_requests r
        JOIN drivers d ON r.driver_id = d.driver_id
        LEFT JOIN drivers td ON r.target_driver_id = td.driver_id
        WHERE r.driver_id = ?
        ORDER BY r.created_at DESC
        """, (driver_id,))
        rows = cursor.fetchall()

        result = []
        for row in rows:
            result.append(ShiftChangeRequestModel(
                requestId=row["request_id"],
                driverId=row["driver_id"],
                driverName=row["driver_name"],
                currentShiftId=row["current_shift_id"],
                requestedShiftDate=row["requested_shift_date"],
                requestedShiftType=row["requested_shift_type"],
                reasonCategory=row["reason_category"],
                reasonDetails=row["reason_details"],
                targetDriverId=row["target_driver_id"],
                targetDriverName=row["target_driver_name"],
                status=row["status"],
                reviewerNotes=row["reviewer_notes"],
                createdAt=row["created_at"],
                updatedAt=row["updated_at"]
            ))
        return result

def create_shift_change_request(
    driver_id: str,
    payload: ShiftChangeRequestCreate
) -> ShiftChangeRequestModel:
    """Submit and persist a new shift change request in SQLite."""
    now = datetime.now()
    now_iso = now.isoformat()
    req_id = f"REQ-{driver_id.replace('DRV-', '')}-{int(now.timestamp())}"

    # Get active shift
    shift = get_driver_shift_duration(driver_id)
    current_shift_id = shift.shiftId if shift else None

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO shift_change_requests (
            request_id, driver_id, current_shift_id, requested_shift_date,
            requested_shift_type, reason_category, reason_details,
            target_driver_id, status, reviewer_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'Under review by Crew Rostering Desk', ?, ?)
        """, (
            req_id,
            driver_id,
            current_shift_id,
            payload.requestedShiftDate,
            payload.requestedShiftType,
            payload.reasonCategory,
            payload.reasonDetails,
            payload.targetDriverId,
            now_iso,
            now_iso
        ))

    requests = get_driver_shift_change_requests(driver_id)
    match = next((r for r in requests if r.requestId == req_id), None)
    if not match:
        raise RuntimeError("Failed to retrieve created shift change request")
    return match
