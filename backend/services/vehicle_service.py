import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..models import (
    VehicleModel,
    VehicleCreate,
    VehicleUpdate,
    VehicleAssignmentRequest,
    MaintenanceScheduleRequest,
    VehicleMaintenanceModel
)

def row_to_vehicle(row) -> VehicleModel:
    comp = {}
    if row["compliance_json"]:
        try:
            comp = json.loads(row["compliance_json"])
        except Exception:
            comp = {}

    return VehicleModel(
        id=row["bus_id"],
        busNumber=row["vehicle_number"],
        regNumber=row["reg_number"] or row["vehicle_number"],
        model=row["model"],
        type=row["type"] or "Electric AC City Bus",
        fuelType=row["fuel_type"] or "Electric",
        capacity=row["capacity"] or 65,
        status=row["status"] or "IN_SERVICE",
        batteryPct=float(row["fuel_or_battery_percent"] or 88.0),
        rangeKm=float(row["range_km"] or 160.0),
        mileageKm=float(row["mileage_km"] or 45000.0),
        odometerKm=float(row["odometer_km"] or 45000.0),
        depot=row["depot"] or "CMBT Central Depot",
        assignedRoute=row["assigned_route_id"],
        assignedDriver=row["assigned_driver_id"],
        speedKmH=float(row["speed_kmh"] or 0.0),
        nextServiceDate=row["next_service_date"],
        lastInspectionDate=row["last_inspection_date"],
        vin=row["vin"],
        compliance=comp,
        city=row["city"] or "chennai"
    )

def get_all_vehicles(city: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None) -> List[VehicleModel]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM vehicles WHERE 1=1"
        params = []

        if city:
            query += " AND (city = ? OR city IS NULL)"
            params.append(city.lower())

        if status and status != 'ALL':
            query += " AND status = ?"
            params.append(status.upper())

        if search:
            query += " AND (vehicle_number LIKE ? OR model LIKE ? OR depot LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [row_to_vehicle(r) for r in rows]

def get_vehicle_by_id(vehicle_id: str) -> Optional[VehicleModel]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vehicles WHERE bus_id = ? OR vehicle_number = ?", (vehicle_id, vehicle_id))
        row = cursor.fetchone()
        return row_to_vehicle(row) if row else None

def create_vehicle(data: VehicleCreate) -> VehicleModel:
    bus_id = data.id or f"bus-{uuid.uuid4().hex[:6]}"
    with get_db() as conn:
        cursor = conn.cursor()
        comp_json = json.dumps({
            "insuranceExpiry": "2027-04-15",
            "fitnessExpiry": "2026-12-30",
            "pollutionExpiry": "2026-11-20",
            "permitExpiry": "2028-06-30"
        })
        cursor.execute("""
        INSERT OR REPLACE INTO vehicles (
            bus_id, vehicle_number, reg_number, model, type, fuel_type,
            capacity, status, fuel_or_battery_percent, range_km, depot,
            assigned_route_id, assigned_driver_id, next_service_date, vin, compliance_json, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            bus_id,
            data.busNumber,
            data.regNumber or data.busNumber,
            data.model,
            data.type,
            data.fuelType,
            data.capacity,
            data.status,
            data.batteryPct,
            data.rangeKm,
            data.depot,
            data.assignedRoute,
            data.assignedDriver,
            data.nextServiceDate or "2026-10-15",
            data.vin or f"VIN-{uuid.uuid4().hex[:8].upper()}",
            comp_json,
            data.city.lower()
        ))
    return get_vehicle_by_id(bus_id)

def update_vehicle(vehicle_id: str, data: VehicleUpdate) -> Optional[VehicleModel]:
    existing = get_vehicle_by_id(vehicle_id)
    if not existing:
        return None

    with get_db() as conn:
        cursor = conn.cursor()
        fields = []
        params = []

        if data.busNumber is not None:
            fields.append("vehicle_number = ?")
            params.append(data.busNumber)
        if data.model is not None:
            fields.append("model = ?")
            params.append(data.model)
        if data.type is not None:
            fields.append("type = ?")
            params.append(data.type)
        if data.fuelType is not None:
            fields.append("fuel_type = ?")
            params.append(data.fuelType)
        if data.capacity is not None:
            fields.append("capacity = ?")
            params.append(data.capacity)
        if data.status is not None:
            fields.append("status = ?")
            params.append(data.status)
        if data.batteryPct is not None:
            fields.append("fuel_or_battery_percent = ?")
            params.append(data.batteryPct)
        if data.rangeKm is not None:
            fields.append("range_km = ?")
            params.append(data.rangeKm)
        if data.depot is not None:
            fields.append("depot = ?")
            params.append(data.depot)
        if data.assignedRoute is not None:
            fields.append("assigned_route_id = ?")
            params.append(data.assignedRoute)
        if data.assignedDriver is not None:
            fields.append("assigned_driver_id = ?")
            params.append(data.assignedDriver)
        if data.nextServiceDate is not None:
            fields.append("next_service_date = ?")
            params.append(data.nextServiceDate)
        if data.vin is not None:
            fields.append("vin = ?")
            params.append(data.vin)

        if fields:
            query = f"UPDATE vehicles SET {', '.join(fields)} WHERE bus_id = ? OR vehicle_number = ?"
            params.extend([vehicle_id, vehicle_id])
            cursor.execute(query, params)

    return get_vehicle_by_id(vehicle_id)

def delete_vehicle(vehicle_id: str) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM vehicles WHERE bus_id = ? OR vehicle_number = ?", (vehicle_id, vehicle_id))
        return cursor.rowcount > 0

def assign_vehicle(vehicle_id: str, route_id: Optional[str], driver_id: Optional[str], shift_time: Optional[str]) -> Optional[VehicleModel]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE vehicles
        SET assigned_route_id = ?, assigned_driver_id = ?, status = 'IN_SERVICE'
        WHERE bus_id = ? OR vehicle_number = ?
        """, (route_id, driver_id, vehicle_id, vehicle_id))
    return get_vehicle_by_id(vehicle_id)

def schedule_maintenance(vehicle_id: str, maintenance_type: str, scheduled_date: str, notes: str = "", priority: str = "MEDIUM") -> VehicleMaintenanceModel:
    mnt_id = f"MNT-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO vehicle_maintenance (
            id, bus_id, type, description, scheduled_date, status, cost, technician, created_at
        ) VALUES (?, ?, ?, ?, ?, 'PENDING', 5000.0, 'Depot Service Team', ?)
        """, (mnt_id, vehicle_id, maintenance_type, notes or f"{maintenance_type} priority: {priority}", scheduled_date, now_iso))

        # Update vehicle nextServiceDate and status if necessary
        cursor.execute("""
        UPDATE vehicles
        SET next_service_date = ?
        WHERE bus_id = ? OR vehicle_number = ?
        """, (scheduled_date, vehicle_id, vehicle_id))

    return VehicleMaintenanceModel(
        id=mnt_id,
        busId=vehicle_id,
        type=maintenance_type,
        description=notes or maintenance_type,
        scheduledDate=scheduled_date,
        status="PENDING",
        cost=5000.0,
        technician="Depot Service Team",
        createdAt=now_iso
    )

def get_fleet_metrics(city: Optional[str] = None) -> Dict[str, Any]:
    vehicles = get_all_vehicles(city)
    total = len(vehicles)
    in_service = sum(1 for v in vehicles if v.status == 'IN_SERVICE')
    standby = sum(1 for v in vehicles if v.status in ('STANDBY_READY', 'AVAILABLE'))
    maintenance = sum(1 for v in vehicles if v.status == 'MAINTENANCE')
    offline = sum(1 for v in vehicles if v.status == 'OFFLINE')
    
    utilization = round((in_service / total) * 100, 1) if total > 0 else 0.0
    health = round(((in_service + standby) / total) * 100) if total > 0 else 100

    return {
        "total": total,
        "inService": in_service,
        "standby": standby,
        "maintenance": maintenance,
        "offline": offline,
        "utilizationPct": utilization,
        "healthPct": health
    }
