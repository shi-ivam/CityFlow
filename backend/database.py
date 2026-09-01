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

def init_db():
    """Initialize database tables and indexes."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Drivers Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            driver_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            license_number TEXT NOT NULL,
            phone TEXT NOT NULL,
            depot TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'ON_DUTY',
            experience_years INTEGER NOT NULL
        )
        """)

        # 2. Vehicles Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            vehicle_number TEXT PRIMARY KEY,
            bus_id TEXT NOT NULL UNIQUE,
            model TEXT NOT NULL,
            capacity INTEGER NOT NULL DEFAULT 65,
            fuel_or_battery_percent REAL NOT NULL DEFAULT 88.0
        )
        """)

        # 3. Routes Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS routes (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            via TEXT NOT NULL,
            category TEXT NOT NULL,
            frequency_minutes INTEGER NOT NULL,
            total_distance_km REAL NOT NULL,
            active_bus_count INTEGER NOT NULL,
            coordinates_json TEXT NOT NULL,
            stops_json TEXT NOT NULL
        )
        """)

        # 4. Active Shifts Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS active_shifts (
            shift_id TEXT PRIMARY KEY,
            driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
            vehicle_number TEXT NOT NULL REFERENCES vehicles(vehicle_number),
            route_id TEXT NOT NULL REFERENCES routes(id),
            shift_type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            planned_end_time TEXT NOT NULL,
            break_duration_minutes INTEGER NOT NULL DEFAULT 30,
            continuous_drive_minutes INTEGER NOT NULL DEFAULT 145,
            status TEXT NOT NULL DEFAULT 'ACTIVE'
        )
        """)

        # 5. Next Shift Allocations Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS next_shifts (
            allocation_id TEXT PRIMARY KEY,
            driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
            vehicle_number TEXT NOT NULL REFERENCES vehicles(vehicle_number),
            route_id TEXT NOT NULL REFERENCES routes(id),
            shift_date TEXT NOT NULL,
            shift_type TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            reporting_depot TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'CONFIRMED'
        )
        """)

        # 6. Shift Change Requests Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS shift_change_requests (
            request_id TEXT PRIMARY KEY,
            driver_id TEXT NOT NULL REFERENCES drivers(driver_id),
            current_shift_id TEXT REFERENCES active_shifts(shift_id),
            requested_shift_date TEXT NOT NULL,
            requested_shift_type TEXT NOT NULL,
            reason_category TEXT NOT NULL,
            reason_details TEXT NOT NULL,
            target_driver_id TEXT REFERENCES drivers(driver_id),
            status TEXT NOT NULL DEFAULT 'PENDING',
            reviewer_notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        # 7. Driver Telemetry Table
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
        
        # Indexes for fast querying
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_shifts_driver ON active_shifts(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_next_shifts_driver ON next_shifts(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_shift_requests_driver ON shift_change_requests(driver_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_driver ON driver_telemetry(driver_id)")
