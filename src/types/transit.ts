export type Coordinates = [number, number]; // [lng, lat]

export interface Stop {
  id: string;
  name: string;
  code: string;
  coordinates: Coordinates;
  isHub?: boolean;
}

export interface TransitRoute {
  id: string;
  code: string; // e.g. "570"
  name: string; // "CMBT ⇄ Siruseri SIPCOT"
  origin: string;
  destination: string;
  via: string;
  category: 'EXPRESS' | 'TRUNK' | 'FEEDER' | 'NIGHT';
  coordinates: Coordinates[];
  stops: Stop[];
  frequencyMinutes: number;
  totalDistanceKm: number;
  activeBusCount: number;
  colorScheme?: string;
}

export interface ActiveBus {
  id: string; // "MTC-570-01"
  vehicleNumber: string; // "TN-01-AN-4421"
  routeId: string;
  routeCode: string;
  driverName: string;
  driverId: string;
  currentCoord: Coordinates;
  heading: number; // in degrees (0 = North)
  speedKmH: number;
  occupancyPercent: number;
  status: 'ON_TIME' | 'DELAYED' | 'EXPRESS' | 'DEPOT_APPROACH';
  delayMinutes: number;
  nextStopName: string;
  nextStopEtaMinutes: number;
  distanceToNextStopM: number;
  progressAlongRoute: number; // 0 to 1
  direction: 1 | -1; // 1 = forward, -1 = reverse
  batteryOrFuelPercent: number;
  lastUpdated: string;
}

export interface FleetKPIs {
  totalActiveBuses: number;
  onTimePercentage: number;
  averageSpeedKmH: number;
  totalPassengersToday: number;
  spatialConflicts: number;
  solverLatencyMs: number;
  fuelEfficiencyIndex: number;
}

export type MapProviderId = 'carto' | 'satellite' | 'osm' | 'stadia' | 'maptiler';

export interface MapProviderOption {
  id: MapProviderId;
  name: string;
  badge: string;
  description: string;
  isFreeTier: boolean;
}

export const MAP_PROVIDERS: MapProviderOption[] = [
  {
    id: 'carto',
    name: 'CARTO OpenStreetMap',
    badge: 'FREE • NO KEY',
    description: 'High-contrast Dark Matter / Positron OSM street tiles',
    isFreeTier: true,
  },
  {
    id: 'satellite',
    name: 'Satellite Hybrid (Esri)',
    badge: 'FREE • HD SATELLITE',
    description: 'High-res aerial imagery with road overlay',
    isFreeTier: true,
  },
  {
    id: 'osm',
    name: 'OpenStreetMap Standard',
    badge: 'FREE • COMMUNITY',
    description: 'Official OpenStreetMap global cartography',
    isFreeTier: true,
  },
  {
    id: 'stadia',
    name: 'Stadia Alidade Smooth',
    badge: 'FREE TIER',
    description: 'Clean vector transit cartography',
    isFreeTier: true,
  },
  {
    id: 'maptiler',
    name: 'MapTiler Vector GL',
    badge: 'FREE TIER • 3D',
    description: 'Vector tiles with 3D buildings & styling',
    isFreeTier: true,
  },
];
