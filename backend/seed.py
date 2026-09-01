import os
import re
import json
from datetime import datetime, timedelta
from .database import get_db, init_db

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TS_ROUTES_FILE = os.path.join(PROJECT_ROOT, "src", "data", "chennaiRoutes.ts")

DEPOT_MAPPING = {
    "route-570": "CMBT Koyambedu Central Depot",
    "route-29c": "Perambur Loco Works Depot",
    "route-21g": "Broadway Central Terminal Depot",
    "route-70v": "Koyambedu Division Depot",
    "route-27d": "Villivakkam Regional Depot",
    "route-47a": "Ayanavaram / ICF Depot",
}

EXPERIENCE_MAPPING = {
    "DRV-7402": 14,
    "DRV-8114": 9,
    "DRV-5541": 18,
    "DRV-3390": 11,
    "DRV-4198": 7,
    "DRV-9012": 21,
    "DRV-6721": 12,
    "DRV-2219": 16,
    "DRV-1188": 8,
    "DRV-8940": 5,
}

SHIFT_SCHEDULES = [
    # driver_id, start_offset_hours, continuous_mins, break_mins
    ("DRV-7402", 5.5, 150, 30), # 5.5 hours into shift
    ("DRV-8114", 3.2, 95, 20),
    ("DRV-5541", 6.8, 190, 40), # higher fatigue
    ("DRV-3390", 4.0, 120, 25),
    ("DRV-4198", 2.1, 70, 15),
    ("DRV-9012", 7.2, 210, 45), # near end of shift
    ("DRV-6721", 1.5, 45, 10),
    ("DRV-2219", 4.8, 140, 30),
    ("DRV-1188", 3.7, 110, 20),
    ("DRV-8940", 5.0, 160, 35),
]

def seed_database():
    """Seed the SQLite database directly from chennaiRoutes.ts data."""
    init_db()
    
    if not os.path.exists(TS_ROUTES_FILE):
        raise FileNotFoundError(f"Routes file not found at {TS_ROUTES_FILE}")

    with open(TS_ROUTES_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Parse CHENNAI_ROUTES
    m_routes = re.search(
        r'export const CHENNAI_ROUTES:\s*TransitRoute\[\]\s*=\s*(\[[\s\S]*?\]);(?=\s*export const INITIAL_BUSES)',
        content
    )
    if not m_routes:
        raise ValueError("Could not extract CHENNAI_ROUTES from chennaiRoutes.ts")
    routes_data = json.loads(m_routes.group(1))

    # 2. Parse INITIAL_BUSES
    m_buses = re.search(
        r'export const INITIAL_BUSES:\s*ActiveBus\[\]\s*=\s*(\[[\s\S]*?\]);(?=\s*export const INITIAL_KPIS)',
        content
    )
    if not m_buses:
        raise ValueError("Could not extract INITIAL_BUSES from chennaiRoutes.ts")
    buses_data = json.loads(m_buses.group(1))

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    tomorrow = now + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")

    with get_db() as conn:
        cursor = conn.cursor()

        # Seed Routes
        for r in routes_data:
            cursor.execute("""
            INSERT OR REPLACE INTO routes (
                id, code, name, origin, destination, via, category,
                frequency_minutes, total_distance_km, active_bus_count,
                coordinates_json, stops_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"],
                r["code"],
                r["name"],
                r["origin"],
                r["destination"],
                r["via"],
                r["category"],
                r["frequencyMinutes"],
                r["totalDistanceKm"],
                r["activeBusCount"],
                json.dumps(r["coordinates"]),
                json.dumps(r["stops"])
            ))

        # Seed Vehicles, Drivers, and Telemetry
        for b in buses_data:
            # Vehicle
            cursor.execute("""
            INSERT OR REPLACE INTO vehicles (
                vehicle_number, bus_id, model, capacity, fuel_or_battery_percent
            ) VALUES (?, ?, ?, ?, ?)
            """, (
                b["vehicleNumber"],
                b["id"],
                "Ashok Leyland Viking 12M BS-VI (MTC Chennai)",
                65,
                float(b["batteryOrFuelPercent"])
            ))

            # Driver
            depot = DEPOT_MAPPING.get(b["routeId"], "CMBT Central Depot")
            experience = EXPERIENCE_MAPPING.get(b["driverId"], 10)
            license_num = f"TN-01-201{10 - (experience % 8)}000{b['driverId'].replace('DRV-', '')}"
            phone_num = f"+91 94440 {b['driverId'].replace('DRV-', '')}21"

            cursor.execute("""
            INSERT OR REPLACE INTO drivers (
                driver_id, name, license_number, phone, depot, status, experience_years
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                b["driverId"],
                b["driverName"],
                license_num,
                phone_num,
                depot,
                "ON_DUTY",
                experience
            ))

            # Driver Telemetry
            cursor.execute("""
            INSERT OR REPLACE INTO driver_telemetry (
                driver_id, bus_id, vehicle_number, route_id,
                current_lng, current_lat, heading, speed_kmh,
                occupancy_percent, status, delay_minutes,
                next_stop_name, next_stop_eta_minutes, distance_to_next_stop_m,
                progress_along_route, direction, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                b["driverId"],
                b["id"],
                b["vehicleNumber"],
                b["routeId"],
                b["currentCoord"][0],
                b["currentCoord"][1],
                float(b["heading"]),
                float(b["speedKmH"]),
                int(b["occupancyPercent"]),
                b["status"],
                float(b["delayMinutes"]),
                b["nextStopName"],
                float(b["nextStopEtaMinutes"]),
                int(b["distanceToNextStopM"]),
                float(b["progressAlongRoute"]),
                int(b["direction"]),
                b["lastUpdated"]
            ))

        # Seed Active Shifts
        for schedule in SHIFT_SCHEDULES:
            drv_id, offset_hours, cont_mins, brk_mins = schedule
            bus_match = next((b for b in buses_data if b["driverId"] == drv_id), None)
            if not bus_match:
                continue

            shift_start = now - timedelta(hours=offset_hours)
            shift_planned_end = shift_start + timedelta(hours=8)
            shift_id = f"SFT-{drv_id}-{today_str.replace('-', '')}"

            shift_type = "MORNING" if shift_start.hour < 12 else ("AFTERNOON" if shift_start.hour < 18 else "NIGHT")

            cursor.execute("""
            INSERT OR REPLACE INTO active_shifts (
                shift_id, driver_id, vehicle_number, route_id, shift_type,
                start_time, planned_end_time, break_duration_minutes,
                continuous_drive_minutes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                shift_id,
                drv_id,
                bus_match["vehicleNumber"],
                bus_match["routeId"],
                shift_type,
                shift_start.isoformat(),
                shift_planned_end.isoformat(),
                brk_mins,
                cont_mins,
                "ACTIVE"
            ))

        # Seed Next Shift Allocations
        for i, b in enumerate(buses_data):
            drv_id = b["driverId"]
            depot = DEPOT_MAPPING.get(b["routeId"], "CMBT Central Depot")
            alloc_id = f"ALC-{drv_id}-{tomorrow_str.replace('-', '')}"
            bay_num = f"Bay {(i % 6) + 1}"
            
            # Next shift alternate timing (e.g. Afternoon or Morning)
            if i % 3 == 0:
                s_type = "GENERAL"
                s_start = "14:00"
                s_end = "22:00"
            elif i % 3 == 1:
                s_type = "MORNING"
                s_start = "06:00"
                s_end = "14:00"
            else:
                s_type = "NIGHT"
                s_start = "22:00"
                s_end = "06:00"

            cursor.execute("""
            INSERT OR REPLACE INTO next_shifts (
                allocation_id, driver_id, vehicle_number, route_id,
                shift_date, shift_type, start_time, end_time,
                reporting_depot, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alloc_id,
                drv_id,
                b["vehicleNumber"],
                b["routeId"],
                tomorrow_str,
                s_type,
                s_start,
                s_end,
                f"{depot} ({bay_num})",
                "CONFIRMED"
            ))

        # Seed Initial Shift Change Requests
        initial_requests = [
            (
                "REQ-7402-001",
                "DRV-7402",
                f"SFT-DRV-7402-{today_str.replace('-', '')}",
                tomorrow_str,
                "MORNING",
                "FATIGUE_PREVENTION",
                "Requested morning shift swap to align with mandatory recovery cycle following consecutive long routes on OMR corridor.",
                "DRV-8114",
                "APPROVED",
                "Approved by Depot Supervisor - Shift slot exchanged with DRV-8114.",
                (now - timedelta(days=2)).isoformat(),
                (now - timedelta(days=1, hours=20)).isoformat()
            ),
            (
                "REQ-3390-001",
                "DRV-3390",
                f"SFT-DRV-3390-{today_str.replace('-', '')}",
                (now + timedelta(days=2)).strftime("%Y-%m-%d"),
                "REST_OFF",
                "FAMILY_EMERGENCY",
                "Attending family medical appointment in Chromepet.",
                None,
                "PENDING",
                "Under review by Crew Rostering Desk.",
                (now - timedelta(hours=4)).isoformat(),
                (now - timedelta(hours=4)).isoformat()
            ),
            (
                "REQ-9012-001",
                "DRV-9012",
                f"SFT-DRV-9012-{today_str.replace('-', '')}",
                (now - timedelta(days=5)).strftime("%Y-%m-%d"),
                "AFTERNOON",
                "ROSTER_PREFERENCE",
                "Requested afternoon slot due to personal transit schedule.",
                None,
                "APPROVED",
                "Approved and roster updated.",
                (now - timedelta(days=6)).isoformat(),
                (now - timedelta(days=5, hours=18)).isoformat()
            )
        ]

        for req in initial_requests:
            cursor.execute("""
            INSERT OR REPLACE INTO shift_change_requests (
                request_id, driver_id, current_shift_id, requested_shift_date,
                requested_shift_type, reason_category, reason_details,
                target_driver_id, status, reviewer_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, req)

    print(f"Database seeded successfully with {len(routes_data)} routes, {len(buses_data)} drivers & vehicles!")

if __name__ == "__main__":
    seed_database()
