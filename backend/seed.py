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

        # Seed Chennai Hubs
        chennai_hubs = [
            ("hub-chn-1", "chennai", "CMBT Koyambedu Terminal", "CMBT-HUB", "Asia's largest bus terminal with 16 bay platforms and crew rest lounge", 16, 6, json.dumps([80.1947, 13.0694])),
            ("hub-chn-2", "chennai", "Chennai Central Railway Interchange", "MAS-HUB", "Primary multimodal interstate rail & bus transit junction", 12, 4, json.dumps([80.2753, 13.0825])),
            ("hub-chn-3", "chennai", "Guindy Bus & Metro Hub", "GND-HUB", "South Chennai industrial & airport highway connector", 10, 5, json.dumps([80.2062, 13.0067])),
            ("hub-chn-4", "chennai", "Tambaram Sanatorium Junction", "TBM-HUB", "Suburban highway corridor transit exchange", 8, 3, json.dumps([80.1200, 12.9249]))
        ]
        for hub in chennai_hubs:
            cursor.execute("""
            INSERT OR REPLACE INTO hubs (id, city, name, code, description, bay_count, active_transfers, coordinates_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, hub)

        # Seed Delhi Hubs
        delhi_hubs = [
            ("hub-1", "delhi", "Kashmere Gate ISBT Hub", "KG-ISBT", "Primary multimodal interstate transit terminal with 12 bay platforms", 12, 5, json.dumps([77.2285, 28.6672])),
            ("hub-2", "delhi", "Anand Vihar ISBT Terminal", "AV-ISBT", "East Delhi & UP border intermodal bus terminal", 10, 3, json.dumps([77.3150, 28.6469])),
            ("hub-3", "delhi", "Rajiv Chowk Interchange", "RC-HUB", "Central Connaught Place high-density passenger junction", 8, 4, json.dumps([77.2183, 28.6328])),
            ("hub-4", "delhi", "Gurugram Bus Stand Terminal", "GUR-HUB", "NCR South expressway connector hub", 6, 2, json.dumps([77.0266, 28.4595]))
        ]
        for hub in delhi_hubs:
            cursor.execute("""
            INSERT OR REPLACE INTO hubs (id, city, name, code, description, bay_count, active_transfers, coordinates_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, hub)

        # Seed Delhi Routes
        delhi_routes = [
            (
                "route-534", "534", "Kashmere Gate → AIIMS → Saket Express", "Kashmere Gate ISBT", "Saket District Centre",
                "Rajiv Chowk, AIIMS", "High-Density Trunk", "#2563eb", 10, 24.5, 12, 50, "05:00 - 23:30 IST", "delhi",
                json.dumps([[77.2285, 28.6672], [77.2240, 28.6500], [77.2183, 28.6328], [77.2130, 28.6000], [77.2090, 28.5672], [77.2075, 28.5450], [77.2066, 28.5244]]),
                json.dumps([
                    {"name": "Kashmere Gate ISBT", "coordinates": [77.2285, 28.6672]},
                    {"name": "Connaught Place / Rajiv Chowk", "coordinates": [77.2183, 28.6328]},
                    {"name": "AIIMS Medical Hub", "coordinates": [77.2090, 28.5672]},
                    {"name": "Saket District Centre", "coordinates": [77.2066, 28.5244]}
                ])
            ),
            (
                "route-725", "725", "Anand Vihar ISBT → Dwarka Sector 21", "Anand Vihar ISBT", "Dwarka Sector 21",
                "Laxmi Nagar, Rajiv Chowk, Dhaula Kuan", "Cross-City Heavy Arterial", "#10b981", 12, 32.8, 14, 50, "05:30 - 00:00 IST", "delhi",
                json.dumps([[77.3150, 28.6469], [77.2950, 28.6380], [77.2770, 28.6300], [77.2400, 28.6310], [77.2183, 28.6328], [77.1900, 28.6100], [77.1650, 28.5910], [77.1100, 28.5700], [77.0580, 28.5520]]),
                json.dumps([
                    {"name": "Anand Vihar ISBT", "coordinates": [77.3150, 28.6469]},
                    {"name": "Laxmi Nagar Metro", "coordinates": [77.2770, 28.6300]},
                    {"name": "Rajiv Chowk Hub", "coordinates": [77.2183, 28.6328]},
                    {"name": "Dhaula Kuan", "coordinates": [77.1650, 28.5910]},
                    {"name": "Dwarka Sector 21", "coordinates": [77.0580, 28.5520]}
                ])
            ),
            (
                "route-410", "410", "Delhi Ring Road Circular Corridor", "Kashmere Gate ISBT", "Kashmere Gate ISBT",
                "ITO, Ashram, AIIMS, Dhaula Kuan, Punjabi Bagh", "Ring Circular Express", "#a855f7", 15, 48.2, 18, 50, "06:00 - 23:00 IST", "delhi",
                json.dumps([[77.2285, 28.6672], [77.2400, 28.6270], [77.2580, 28.5710], [77.2090, 28.5672], [77.1650, 28.5910], [77.1250, 28.6700], [77.2285, 28.6672]]),
                json.dumps([
                    {"name": "Kashmere Gate ISBT", "coordinates": [77.2285, 28.6672]},
                    {"name": "ITO Junction", "coordinates": [77.2400, 28.6270]},
                    {"name": "Ashram Chowk", "coordinates": [77.2580, 28.5710]},
                    {"name": "AIIMS Medical Hub", "coordinates": [77.2090, 28.5672]},
                    {"name": "Dhaula Kuan", "coordinates": [77.1650, 28.5910]},
                    {"name": "Punjabi Bagh", "coordinates": [77.1250, 28.6700]}
                ])
            ),
            (
                "route-604", "604", "CP → Dhaula Kuan → Gurugram Corridor", "Connaught Place", "Gurugram Bus Stand",
                "Chanakyapuri, Dhaula Kuan, Cyber City", "NCR Interstate Express", "#f59e0b", 20, 36.4, 8, 50, "06:00 - 22:30 IST", "delhi",
                json.dumps([[77.2183, 28.6328], [77.1900, 28.6100], [77.1650, 28.5910], [77.1300, 28.5400], [77.0880, 28.4950], [77.0500, 28.4750], [77.0266, 28.4595]]),
                json.dumps([
                    {"name": "Connaught Place (Outer Circle)", "coordinates": [77.2183, 28.6328]},
                    {"name": "Dhaula Kuan Express", "coordinates": [77.1650, 28.5910]},
                    {"name": "Gurugram Cyber City", "coordinates": [77.0880, 28.4950]},
                    {"name": "Gurugram Bus Stand", "coordinates": [77.0266, 28.4595]}
                ])
            )
        ]
        for r in delhi_routes:
            cursor.execute("""
            INSERT OR REPLACE INTO routes (
                id, code, name, origin, destination, via, category, color,
                frequency_minutes, total_distance_km, active_bus_count, buffer_meters,
                operating_hours, city, coordinates_json, stops_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, r)

        # Seed Delhi Drivers
        delhi_drivers = [
            ("DRV-1042", "Rajesh Kumar", "BADGE-1042", "DL-04201800921", "+91 98110 42891", "Kashmere Gate ISBT", "ASSIGNED", 8, 0, 6.5, 32.0, "delhi", "bus-101", "route-534", 0),
            ("DRV-1043", "Amit Sharma", "BADGE-1043", "DL-04201904128", "+91 98110 43922", "Kashmere Gate ISBT", "ASSIGNED", 6, 0, 8.0, 42.0, "delhi", "bus-102", "route-534", 1),
            ("DRV-1044", "Suresh Yadav", "BADGE-1044", "UP-16201700412", "+91 98110 44015", "Anand Vihar ISBT", "ASSIGNED", 11, 0, 5.0, 28.0, "delhi", "bus-201", "route-725", 0),
            ("DRV-1045", "Vijay Singh", "BADGE-1045", "HR-26202008819", "+91 98110 45781", "Gurugram Depot", "ASSIGNED", 4, 0, 7.0, 35.0, "delhi", "bus-401", "route-604", 0),
            ("DRV-1046", "Manoj Verma", "BADGE-1046", "DL-01201605542", "+91 98110 46119", "Kashmere Gate ISBT", "ASSIGNED", 9, 0, 6.0, 30.0, "delhi", "bus-301", "route-410", 0),
            ("DRV-SBY-01", "Ramesh Chand (Reserve)", "BADGE-SBY01", "DL-01201500112", "+91 98110 50001", "Kashmere Gate ISBT", "STANDBY_READY", 12, 1, 0.0, 16.0, "delhi", None, None, 0)
        ]
        for d in delhi_drivers:
            cursor.execute("""
            INSERT OR REPLACE INTO drivers (
                driver_id, name, badge_number, license_number, phone, depot, status,
                experience_years, is_standby, daily_driving_hours, weekly_driving_hours,
                city, assigned_bus_id, assigned_route_id, violations_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, d)

        # Seed Delhi Vehicles
        delhi_vehicles = [
            ("bus-101", "DL 1PC 4821", "DL 1PC 4821", "Tata Starbus Ultra EV 12m", "Electric Low-Floor EV", "ELECTRIC", 50, "IN_SERVICE", 92.0, 186.0, 84231.0, 84231.0, "Kashmere Gate ISBT", "route-534", "DRV-1042", 42.0, "2026-09-18", "2026-08-21", "MAT624001N8A94120", json.dumps({"insuranceExpiry": "2027-03-15", "fitnessExpiry": "2026-11-20", "pollutionExpiry": "2026-10-05", "permitExpiry": "2028-06-30"}), "delhi"),
            ("bus-102", "DL 1AB 7314", "DL 1AB 7314", "Ashok Leyland JanBus AC CNG", "CNG Air-Conditioned", "CNG", 55, "IN_SERVICE", 88.0, 210.0, 112450.0, 112450.0, "Kashmere Gate ISBT", "route-534", "DRV-1043", 36.0, "2026-09-24", "2026-08-15", "MAL112003P8B11049", json.dumps({"insuranceExpiry": "2027-01-10", "fitnessExpiry": "2026-10-18", "pollutionExpiry": "2026-09-28", "permitExpiry": "2027-12-31"}), "delhi"),
            ("bus-201", "MH 12 KT 7421", "MH 12 KT 7421", "JBM Ecolife Electric 12m", "Electric High-Capacity", "ELECTRIC", 60, "IN_SERVICE", 74.0, 142.0, 62100.0, 62100.0, "Anand Vihar ISBT", "route-725", "DRV-1044", 48.0, "2026-09-12", "2026-08-10", "JBM881002M7C44109", json.dumps({"insuranceExpiry": "2027-04-05", "fitnessExpiry": "2026-12-15", "pollutionExpiry": "2026-11-10", "permitExpiry": "2028-05-12"}), "delhi"),
            ("bus-301", "UP 16 BX 1298", "UP 16 BX 1298", "Tata Marcopolo CNG Non-AC", "Standard City Bus", "CNG", 60, "IN_SERVICE", 62.0, 180.0, 145890.0, 145890.0, "Kashmere Gate ISBT", "route-410", "DRV-1046", 32.0, "2026-09-08", "2026-07-28", "MAT552009K9A33190", json.dumps({"insuranceExpiry": "2026-12-30", "fitnessExpiry": "2026-09-15", "pollutionExpiry": "2026-09-10", "permitExpiry": "2027-08-20"}), "delhi"),
            ("bus-401", "RJ 14 CB 9012", "RJ 14 CB 9012", "Volvo 9400 B8R Intercity", "Premium Intercity Coach", "DIESEL", 45, "IN_SERVICE", 81.0, 390.0, 98400.0, 98400.0, "Gurugram Depot", "route-604", "DRV-1045", 55.0, "2026-10-02", "2026-08-25", "VOL940022L6D19082", json.dumps({"insuranceExpiry": "2027-02-28", "fitnessExpiry": "2027-01-14", "pollutionExpiry": "2026-12-01", "permitExpiry": "2028-09-15"}), "delhi"),
            ("bus-501", "DL 1EV 0088", "DL 1EV 0088", "Olectra K9 Electric 12m", "Electric AC Low Floor", "ELECTRIC", 48, "STANDBY_READY", 96.0, 220.0, 28400.0, 28400.0, "Kashmere Gate ISBT", None, None, 0.0, "2026-10-15", "2026-08-30", "OLE771004Q9E55201", json.dumps({"insuranceExpiry": "2027-06-20", "fitnessExpiry": "2027-05-10", "pollutionExpiry": "2027-04-15", "permitExpiry": "2028-11-30"}), "delhi"),
            ("bus-502", "DL 1EV 0092", "DL 1EV 0092", "Switch EiV 12 Electric", "Electric AC Low Floor", "ELECTRIC", 52, "MAINTENANCE", 15.0, 30.0, 54200.0, 54200.0, "Kashmere Gate ISBT", None, None, 0.0, "2026-09-03", "2026-08-01", "SWI992001R8F77310", json.dumps({"insuranceExpiry": "2026-11-15", "fitnessExpiry": "2026-09-05", "pollutionExpiry": "2026-09-02", "permitExpiry": "2027-07-10"}), "delhi")
        ]
        for v in delhi_vehicles:
            cursor.execute("""
            INSERT OR REPLACE INTO vehicles (
                bus_id, vehicle_number, reg_number, model, type, fuel_type,
                capacity, status, fuel_or_battery_percent, range_km, mileage_km,
                odometer_km, depot, assigned_route_id, assigned_driver_id, speed_kmh,
                next_service_date, last_inspection_date, vin, compliance_json, city
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, v)

        # Seed Scheduled Trips
        scheduled_trips = [
            ("TRIP-534-001", "delhi", "route-534", "534", "06:30 AM", "07:45 AM", "Kashmere Gate ISBT", "Saket District Centre", "bus-101", "DRV-1042", "COMPLETED", 1),
            ("TRIP-534-002", "delhi", "route-534", "534", "08:30 AM", "09:45 AM", "Kashmere Gate ISBT", "Saket District Centre", "bus-102", "DRV-1043", "RUNNING", 1),
            ("TRIP-534-003", "delhi", "route-534", "534", "10:00 AM", "11:15 AM", "Kashmere Gate ISBT", "Saket District Centre", "bus-101", "DRV-1042", "SCHEDULED", 1),
            ("TRIP-725-001", "delhi", "route-725", "725", "07:00 AM", "08:35 AM", "Anand Vihar ISBT", "Dwarka Sector 21", "bus-201", "DRV-1044", "RUNNING", 1),
            ("TRIP-410-001", "delhi", "route-410", "410", "07:30 AM", "09:45 AM", "Kashmere Gate ISBT", "Kashmere Gate ISBT", "bus-301", "DRV-1046", "RUNNING", 1),
            ("TRIP-604-001", "delhi", "route-604", "604", "08:00 AM", "09:30 AM", "Connaught Place", "Gurugram Bus Stand", "bus-401", "DRV-1045", "RUNNING", 1),
            ("TRIP-CHN-570-01", "chennai", "route-570", "570", "06:00 AM", "07:40 AM", "CMBT Koyambedu", "Siruseri IT Park (SIPCOT)", "bus-101", "DRV-7402", "RUNNING", 1),
            ("TRIP-CHN-29C-01", "chennai", "route-29c", "29C", "06:15 AM", "07:15 AM", "Perambur Loco Works", "Besant Nagar Beach", "bus-103", "DRV-5541", "RUNNING", 1)
        ]
        for t in scheduled_trips:
            cursor.execute("""
            INSERT OR REPLACE INTO trips (
                id, city, route_id, route_code, departure_time, arrival_time,
                origin_hub, dest_hub, assigned_bus_id, assigned_driver_id, status, trip_direction
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, t)

        # Seed Master Duties
        initial_duties = [
            (
                "duty-534-1", "delhi", "DT-LINK-534", "LINKED", "DRV-1042", "bus-101", "route-534",
                "2026-09-01T06:00:00Z", "2026-09-01T14:00:00Z", "2026-09-02T01:00:00Z",
                "ACTIVE_SCHEDULED", None, "Kashmere Gate to Saket Express run. DL 1PC 4821 dedicated."
            ),
            (
                "duty-534-2", "delhi", "DT-UNLINK-534B", "UNLINKED", "DRV-1043", "bus-102", "route-534",
                "2026-09-01T08:00:00Z", "2026-09-01T16:00:00Z", "2026-09-02T03:00:00Z",
                "CONFLICT_DETECTED", None, "Shift ending at 16:00 creates violation if next duty starts at 01:00 (Only 9h rest vs 11h required)."
            ),
            (
                "duty-chn-570-1", "chennai", "DT-CHN-570-A", "LINKED", "DRV-7402", "bus-101", "route-570",
                "2026-09-01T05:30:00Z", "2026-09-01T13:30:00Z", "2026-09-02T00:30:00Z",
                "ACTIVE_SCHEDULED", None, "OMR IT Corridor express rotation. TN 01 N 9401."
            )
        ]
        for d in initial_duties:
            cursor.execute("""
            INSERT OR REPLACE INTO duties (
                id, city, duty_code, duty_type, crew_id, bus_id, route_id,
                start_time, end_time, mandatory_rest_end, status, resolved_via_tier, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, d)

        # Seed Sample Vehicle Maintenance Records
        maintenance_records = [
            ("MNT-001", "bus-101", "Scheduled Periodic Inspection", "50,000 km periodic inspection & brake check", "2026-08-21", "COMPLETED", 4200.0, "Devendra S.", "2026-08-21T09:00:00Z"),
            ("MNT-002", "bus-101", "Brake Pad & Regen Calibration", "Regenerative braking sensor tuning", "2026-06-10", "COMPLETED", 12800.0, "R. Verma", "2026-06-10T14:30:00Z"),
            ("MNT-003", "bus-502", "Traction Inverter Error Fix", "Inverter overheat alarm diagnostic and coolant flush", "2026-09-03", "IN_PROGRESS", 18500.0, "EV Specialist Team", "2026-09-01T11:00:00Z")
        ]
        for m in maintenance_records:
            cursor.execute("""
            INSERT OR REPLACE INTO vehicle_maintenance (
                id, bus_id, type, description, scheduled_date, status, cost, technician, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, m)

    print(f"Database seeded successfully with {len(routes_data) + len(delhi_routes)} routes, multi-city hubs, vehicles, drivers & duties!")

if __name__ == "__main__":
    seed_database()
