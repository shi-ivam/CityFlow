/**
 * adminApi.ts
 * Frontend API client for CityFlow Admin Control Center operations.
 * Communicates with the FastAPI backend at http://127.0.0.1:8000/api/*
 * Automatically falls back to local data if backend is offline.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      console.warn(`[adminApi] HTTP ${res.status} on ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    // Graceful offline fallback
    console.debug(`[adminApi] Offline or backend unreachable for ${endpoint}:`, err);
    return null;
  }
}

// ----------------------------------------------------
// Vehicles / Fleet
// ----------------------------------------------------
export async function fetchAdminVehicles(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any[]>(`/vehicles${query}`);
}

export async function createAdminVehicle(payload: any) {
  return request<any>(`/vehicles`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminVehicle(vehicleId: string, payload: any) {
  return request<any>(`/vehicles/${vehicleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminVehicle(vehicleId: string) {
  return request<any>(`/vehicles/${vehicleId}`, {
    method: 'DELETE',
  });
}

export async function scheduleVehicleMaintenance(vehicleId: string, payload: any) {
  return request<any>(`/vehicles/${vehicleId}/maintenance`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function assignVehicle(vehicleId: string, payload: any) {
  return request<any>(`/vehicles/${vehicleId}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ----------------------------------------------------
// Drivers
// ----------------------------------------------------
export async function fetchAdminDrivers(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any[]>(`/admin/drivers${query}`);
}

export async function createAdminDriver(payload: any) {
  return request<any>(`/admin/drivers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminDriver(driverId: string, payload: any) {
  return request<any>(`/admin/drivers/${driverId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deactivateAdminDriver(driverId: string) {
  return request<any>(`/admin/drivers/${driverId}`, {
    method: 'DELETE',
  });
}

export async function assignAdminDriver(driverId: string, payload: any) {
  return request<any>(`/admin/drivers/${driverId}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateShiftChangeStatus(requestId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
  return request<any>(`/shift-change/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reviewerNotes: notes }),
  });
}

// ----------------------------------------------------
// Routes & Hubs
// ----------------------------------------------------
export async function fetchAdminRoutes(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any[]>(`/routes${query}`);
}

export async function createAdminRoute(payload: any) {
  return request<any>(`/routes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminRoute(routeId: string, payload: any) {
  return request<any>(`/routes/${routeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminRoute(routeId: string) {
  return request<any>(`/routes/${routeId}`, {
    method: 'DELETE',
  });
}

export async function fetchAdminHubs(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any[]>(`/hubs${query}`);
}

// ----------------------------------------------------
// Trips & Duties
// ----------------------------------------------------
export async function fetchAdminTrips(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any[]>(`/trips${query}`);
}

export async function scheduleAdminTrip(payload: any) {
  return request<any>(`/trips`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminDuties(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any[]>(`/duties${query}`);
}

export async function saveAdminDuty(payload: any) {
  return request<any>(`/duties`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function solveDutyConflicts(dutyId: string, strategy: string = 'AUTO') {
  return request<any>(`/duties/solve-conflicts`, {
    method: 'POST',
    body: JSON.stringify({ dutyId, strategy }),
  });
}

// ----------------------------------------------------
// Metrics
// ----------------------------------------------------
export async function fetchAdminMetrics(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return request<any>(`/admin/metrics${query}`);
}
