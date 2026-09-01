import sqlite3
import os
from contextlib import contextmanager

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "cityflow.db")

def get_db_connection():
    """Create and return a database connection with dict-like row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def get_db():
    """Context manager for safe database transactions."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def ensure_columns(cursor, table_name, expected_columns):
    cursor.execute(f"PRAGMA table_info({table_name})")
    existing_cols = {row["name"] for row in cursor.fetchall()}
    for col_name, col_type in expected_columns.items():
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}")

def init_db():
    """Initialize database tables and indexes for multi-city transit operations."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Drivers Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            driver_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            badge_number TEXT,
            license_number TEXT NOT NULL,
            phone TEXT NOT NULL,
            depot TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'AVAILABLE',
            experience_years INTEGER NOT NULL DEFAULT 5,
            is_standby INTEGER NOT NULL DEFAULT 0,
            daily_driving_hours REAL NOT NULL DEFAULT 4.5,
            weekly_driving_hours REAL NOT NULL DEFAULT 24.0,
            city TEXT NOT NULL DEFAULT 'chennai',
            assigned_bus_id TEXT,
            assigned_route_id TEXT,
            violations_count INTEGER NOT NULL DEFAULT 0,
            last_duty_end TEXT,
            next_duty_start TEXT
        )
        """)
        ensure_columns(cursor, "drivers", {
            "badge_number": "TEXT",
            "is_standby": "INTEGER NOT NULL DEFAULT 0",
            "daily_driving_hours": "REAL NOT NULL DEFAULT 4.5",
            "weekly_driving_hours": "REAL NOT NULL DEFAULT 24.0",
            "city": "TEXT NOT NULL DEFAULT 'chennai'",
            "assigned_bus_id": "TEXT",
            "assigned_route_id": "TEXT",
            "violations_count": "INTEGER NOT NULL DEFAULT 0",
            "last_duty_end": "TEXT",
            "next_duty_start": "TEXT"
        })

        # 2. Vehicles / Bus Fleet Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            bus_id TEXT PRIMARY KEY,
            vehicle_number TEXT NOT NULL UNIQUE,
            reg_number TEXT,
            model TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'Electric AC City Bus',
            fuel_type TEXT NOT NULL DEFAULT 'Electric',
            capacity INTEGER NOT NULL DEFAULT 65,
            status TEXT NOT NULL DEFAULT 'IN_SERVICE',
            fuel_or_battery_percent REAL NOT NULL DEFAULT 88.0,
            range_km REAL NOT NULL DEFAULT 160.0,
            mileage_km REAL NOT NULL DEFAULT 45000.0,
            odometer_km REAL NOT NULL DEFAULT 45000.0,
            depot TEXT NOT NULL DEFAULT 'CMBT Central Depot',
            assigned_route_id TEXT,
            assigned_driver_id TEXT,
            speed_kmh REAL NOT NULL DEFAULT 0.0,
            next_service_date TEXT,
            last_inspection_date TEXT,
            vin TEXT,
            compliance_json TEXT,
            city TEXT NOT NULL DEFAULT 'chennai'
        )
        """)
        ensure_columns(cursor, "vehicles", {
            "bus_id": "TEXT",
            "reg_number": "TEXT",
            "type": "TEXT NOT NULL DEFAULT 'Electric AC City Bus'",
            "fuel_type": "TEXT NOT NULL DEFAULT 'Electric'",
            "status": "TEXT NOT NULL DEFAULT 'IN_SERVICE'",
            "range_km": "REAL NOT NULL DEFAULT 160.0",
            "mileage_km": "REAL NOT NULL DEFAULT 45000.0",
            "odometer_km": "REAL NOT NULL DEFAULT 45000.0",
            "depot": "TEXT NOT NULL DEFAULT 'CMBT Central Depot'",
            "assigned_route_id": "TEXT",
            "assigned_driver_id": "TEXT",
            "speed_kmh": "REAL NOT NULL DEFAULT 0.0",
            "next_service_date": "TEXT",
            "last_inspection_date": "TEXT",
            "vin": "TEXT",
            "compliance_json": "TEXT",
            "city": "TEXT NOT NULL DEFAULT 'chennai'"
        })

        # 3. Routes Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS routes (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            via TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'High-Density Corridor',
            color TEXT NOT NULL DEFAULT '#2563eb',
            frequency_minutes INTEGER NOT NULL DEFAULT 10,
            total_distance_km REAL NOT NULL DEFAULT 20.0,
            active_bus_count INTEGER NOT NULL DEFAULT 10,
            buffer_meters INTEGER NOT NULL DEFAULT 50,
            operating_hours TEXT NOT NULL DEFAULT '05:00 - 23:30 IST',
            city TEXT NOT NULL DEFAULT 'chennai',
            coordinates_json TEXT NOT NULL,
            stops_json TEXT NOT NULL
        )
        """)
        ensure_columns(cursor, "routes", {
            "color": "TEXT NOT NULL DEFAULT '#2563eb'",
            "buffer_meters": "INTEGER NOT NULL DEFAULT 50",
            "operating_hours": "TEXT NOT NULL DEFAULT '05:00 - 23:30 IST'",
            "city": "TEXT NOT NULL DEFAULT 'chennai'"
        })

        # 4. Hubs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hubs (
            id TEXT PRIMARY KEY,
            city TEXT NOT NULL DEFAULT 'chennai',
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            description TEXT,
            bay_count INTEGER NOT NULL DEFAULT 8,
            active_transfers INTEGER NOT NULL DEFAULT 3,
            coordinates_json TEXT NOT NULL
        )
        """)

        # 5. Trips Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS trips (
            id TEXT PRIMARY KEY,
            city TEXT NOT NULL DEFAULT 'chennai',
            route_id TEXT NOT NULL,
            route_code TEXT NOT NULL,
            departure_time TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            origin_hub TEXT NOT NULL,
            dest_hub TEXT NOT NULL,
            assigned_bus_id TEXT,
            assigned_driver_id TEXT,
            status TEXT NOT NULL DEFAULT 'SCHEDULED',
            trip_direction INTEGER NOT NULL DEFAULT 1
        )
        """)

        # 6. Master Duties / Roster Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS duties (
            id TEXT PRIMARY KEY,
            city TEXT NOT NULL DEFAULT 'chennai',
            duty_code TEXT NOT NULL,
            duty_type TEXT NOT NULL DEFAULT 'LINKED',
            crew_id TEXT NOT NULL,
            bus_id TEXT NOT NULL,
            route_id TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            mandatory_rest_end TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ACTIVE_SCHEDULED',
            resolved_via_tier INTEGER,
            notes TEXT
        )
        """)

        # 7. Vehicle Maintenance Records Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicle_maintenance (
            id TEXT PRIMARY KEY,
            bus_id TEXT NOT NULL,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            scheduled_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING',
            cost REAL NOT NULL DEFAULT 0.0,
            technician TEXT NOT NULL DEFAULT 'Depot Workshop Team',
            created_at TEXT NOT NULL
        )
        """)

        # 8. Active Shifts Table (for Driver Portal)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS active_shifts (
            shift_id TEXT PRIMARY KEY,
            driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
            vehicle_number TEXT NOT NULL,
            route_id TEXT NOT NULL,
            shift_type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            planned_end_time TEXT NOT NULL,
            break_duration_minutes INTEGER NOT NULL DEFAULT 30,
            continuous_drive_minutes INTEGER NOT NULL DEFAULT 145,
            status TEXT NOT NULL DEFAULT 'ACTIVE'
        )
        """)

        # 9. Next Shift Allocations Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS next_shifts (
            allocation_id TEXT PRIMARY KEY,
            driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
            vehicle_number TEXT NOT NULL,
            route_id TEXT NOT NULL,
            shift_date TEXT NOT NULL,
            shift_type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            reporting_depot TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'CONFIRMED'
        )
        """)

        # 10. Shift Change Requests Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS shift_change_requests (
            request_id TEXT PRIMARY KEY,
            driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
            current_shift_id TEXT,
            requested_shift_date TEXT NOT NULL,
            requested_shift_type TEXT NOT NULL,
            reason_category TEXT NOT NULL,
            reason_details TEXT NOT NULL,
            target_driver_id TEXT,
            status TEXT NOT NULL DEFAULT 'PENDING',
            reviewer_notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        # 11. Driver Telemetry Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS driver_telemetry (
            driver_id TEXT PRIMARY KEY REFERENCES drivers(driver_id),
            bus_id TEXT NOT NULL,
            vehicle_number TEXT NOT NULL,
            route_id TEXT NOT NULL,
            current_lng REAL NOT NULL,
            current_lat REAL NOT NULL,
            heading REAL NOT NULL,
            speed_kmh REAL NOT NULL,
            occupancy_percent INTEGER NOT NULL,
            status TEXT NOT NULL,
            delay_minutes REAL NOT NULL,
            next_stop_name TEXT NOT NULL,
            next_stop_eta_minutes REAL NOT NULL,
            distance_to_next_stop_m INTEGER NOT NULL,
            progress_along_route REAL NOT NULL,
            direction INTEGER NOT NULL,
            last_updated TEXT NOT NULL
        )
        """)
        
        # 12. Admin Audit Logs & Overrides Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_audit_logs (
            id TEXT PRIMARY KEY,
            action_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            payload_json TEXT,
            timestamp TEXT NOT NULL
        )
        """)

        # Indexes for fast querying
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_drivers_city ON drivers(city)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vehicles_city ON vehicles(city)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_routes_city ON routes(city)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_trips_city ON trips(city)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_duties_city ON duties(city)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_shifts_driver ON active_shifts(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_next_shifts_driver ON next_shifts(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_shift_requests_driver ON shift_change_requests(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_driver ON driver_telemetry(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_maintenance_bus ON vehicle_maintenance(bus_id)")
