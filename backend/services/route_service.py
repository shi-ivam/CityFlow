import json
import uuid
from typing import List, Optional, Dict, Any
from ..database import get_db
from ..models import (
    RouteDetailModel,
    RouteCreateModel,
    RouteUpdateModel,
    StopModel,
    HubModel
)

def row_to_route(row) -> RouteDetailModel:
    stops_list = []
    coords_list = []
    if row["stops_json"]:
        try:
            stops_raw = json.loads(row["stops_json"])
            for idx, s in enumerate(stops_raw):
                stops_list.append(StopModel(
                    id=s.get("id", f"stop-{idx+1}"),
                    name=s.get("name", f"Stop {idx+1}"),
                    code=s.get("code", f"STP-{idx+1}"),
                    coordinates=s.get("coordinates", [80.20, 13.00]),
                    isHub=s.get("isHub", False)
                ))
        except Exception:
            stops_list = []

    if row["coordinates_json"]:
        try:
            coords_list = json.loads(row["coordinates_json"])
        except Exception:
            coords_list = []

    return RouteDetailModel(
        id=row["id"],
        code=row["code"],
        name=row["name"],
        origin=row["origin"],
        destination=row["destination"],
        via=row["via"],
        category=row["category"],
        frequencyMinutes=row["frequency_minutes"],
        totalDistanceKm=float(row["total_distance_km"]),
        activeBusCount=row["active_bus_count"],
        stops=stops_list,
        coordinates=coords_list
    )

def row_to_hub(row) -> HubModel:
    coords = [80.20, 13.00]
    if row["coordinates_json"]:
        try:
            coords = json.loads(row["coordinates_json"])
        except Exception:
            coords = [80.20, 13.00]

    return HubModel(
        id=row["id"],
        city=row["city"] or "chennai",
        name=row["name"],
        code=row["code"],
        description=row["description"],
        bayCount=row["bay_count"] or 8,
        activeTransfers=row["active_transfers"] or 3,
        coordinates=coords
    )

def get_all_routes(city: Optional[str] = None) -> List[RouteDetailModel]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM routes WHERE 1=1"
        params = []
        if city:
            query += " AND (city = ? OR city IS NULL)"
            params.append(city.lower())

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [row_to_route(r) for r in rows]

def get_route_by_id(route_id: str) -> Optional[RouteDetailModel]:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM routes WHERE id = ? OR code = ?", (route_id, route_id))
        row = cursor.fetchone()
        return row_to_route(row) if row else None

def create_route(data: RouteCreateModel) -> RouteDetailModel:
    with get_db() as conn:
        cursor = conn.cursor()
        stops_dicts = [s.model_dump() for s in data.stops]
        cursor.execute("""
        INSERT OR REPLACE INTO routes (
            id, code, name, origin, destination, via, category, color,
            frequency_minutes, total_distance_km, active_bus_count, buffer_meters,
            operating_hours, city, coordinates_json, stops_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.id,
            data.code,
            data.name,
            data.origin,
            data.destination,
            data.via,
            data.category,
            data.color,
            data.frequencyMinutes,
            data.totalDistanceKm,
            data.activeBusCount,
            data.bufferMeters,
            data.operatingHours,
            data.city.lower(),
            json.dumps(data.coordinates),
            json.dumps(stops_dicts)
        ))
    return get_route_by_id(data.id)

def update_route(route_id: str, data: RouteUpdateModel) -> Optional[RouteDetailModel]:
    existing = get_route_by_id(route_id)
    if not existing:
        return None

    with get_db() as conn:
        cursor = conn.cursor()
        fields = []
        params = []

        if data.code is not None:
            fields.append("code = ?")
            params.append(data.code)
        if data.name is not None:
            fields.append("name = ?")
            params.append(data.name)
        if data.origin is not None:
            fields.append("origin = ?")
            params.append(data.origin)
        if data.destination is not None:
            fields.append("destination = ?")
            params.append(data.destination)
        if data.via is not None:
            fields.append("via = ?")
            params.append(data.via)
        if data.category is not None:
            fields.append("category = ?")
            params.append(data.category)
        if data.color is not None:
            fields.append("color = ?")
            params.append(data.color)
        if data.frequencyMinutes is not None:
            fields.append("frequency_minutes = ?")
            params.append(data.frequencyMinutes)
        if data.totalDistanceKm is not None:
            fields.append("total_distance_km = ?")
            params.append(data.totalDistanceKm)
        if data.bufferMeters is not None:
            fields.append("buffer_meters = ?")
            params.append(data.bufferMeters)
        if data.operatingHours is not None:
            fields.append("operating_hours = ?")
            params.append(data.operatingHours)

        if fields:
            query = f"UPDATE routes SET {', '.join(fields)} WHERE id = ? OR code = ?"
            params.extend([route_id, route_id])
            cursor.execute(query, params)

    return get_route_by_id(route_id)

def delete_route(route_id: str) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM routes WHERE id = ? OR code = ?", (route_id, route_id))
        return cursor.rowcount > 0

def get_all_hubs(city: Optional[str] = None) -> List[HubModel]:
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM hubs WHERE 1=1"
        params = []
        if city:
            query += " AND (city = ? OR city IS NULL)"
            params.append(city.lower())

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [row_to_hub(r) for r in rows]
