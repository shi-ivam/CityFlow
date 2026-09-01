import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { TransitRoute, Coordinates } from '../../types/transit';
import { DriverTelemetry } from '../../services/api';
import { MapPin, Target, Route as RouteIcon } from 'lucide-react';

interface DriverRouteMapProps {
  route: TransitRoute;
  telemetry: DriverTelemetry;
  theme: 'dark' | 'light';
  maptilerKey?: string;
}

function getMapStyle(theme: 'dark' | 'light', maptilerKey = '') {
  // Vector GL style matching the landing page (with fallback to MapTiler key if needed)
  const key = maptilerKey.trim() || 'get_your_own_OpIi9ZULNHzrESv6T2vL';
  return theme === 'dark'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
}

export const DriverRouteMap: React.FC<DriverRouteMapProps> = ({
  route,
  telemetry,
  theme,
  maptilerKey = 'get_your_own_OpIi9ZULNHzrESv6T2vL',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busMarkerRef = useRef<Marker | null>(null);
  const stopMarkersRef = useRef<Marker[]>([]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCoord = telemetry.currentCoord || route.coordinates[0] || [80.23, 13.035];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(theme, maptilerKey),
      center: initialCoord,
      zoom: 12.5,
      pitch: 25,
      bearing: 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add Route Line GeoJSON Source
      map.addSource('driver-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        },
      });

      // Route Base Casing
      map.addLayer({
        id: 'driver-route-casing',
        type: 'line',
        source: 'driver-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#000000',
          'line-width': 6,
          'line-opacity': 0.2,
        },
      });

      // Clean Solid High-Contrast Route Line (No stippled vibration)
      map.addLayer({
        id: 'driver-route-main',
        type: 'line',
        source: 'driver-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#111111',
          'line-width': 3.5,
          'line-opacity': 0.95,
        },
      });

      // Fit Bounds to Route
      if (route.coordinates.length > 1) {
        const bounds = route.coordinates.reduce(
          (acc, coord) => acc.extend(coord),
          new maplibregl.LngLatBounds(route.coordinates[0], route.coordinates[0])
        );
        map.fitBounds(bounds, { padding: 40, maxZoom: 14.5, duration: 800 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [route.id, theme]);

  // 2. Stop Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    route.stops.forEach((stop, idx) => {
      const el = document.createElement('div');
      el.className = 'group relative flex items-center justify-center cursor-pointer';

      const isHub = stop.isHub;
      const isNextStop = stop.name.toLowerCase() === telemetry.nextStopName.toLowerCase();

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-3.5 h-3.5 rounded-full ${
            isNextStop
              ? 'bg-foreground border-2 border-background ring-2 ring-foreground scale-125'
              : isHub
              ? 'bg-background border-2 border-foreground'
              : 'bg-muted border border-border'
          } flex items-center justify-center shadow-sm transition-transform hover:scale-125">
            <div class="w-1.5 h-1.5 rounded-full ${
              isNextStop ? 'bg-background' : 'bg-foreground'
            }"></div>
          </div>
        </div>
        <div class="absolute bottom-5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
          <div class="px-2 py-1 bg-card border border-border text-foreground font-mono text-[10px] whitespace-nowrap rounded shadow-md">
            <strong>${idx + 1}. ${stop.name}</strong> ${isHub ? '(Hub)' : ''}
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(stop.coordinates)
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });

    return () => {
      stopMarkersRef.current.forEach((m) => m.remove());
      stopMarkersRef.current = [];
    };
  }, [route.stops, telemetry.nextStopName]);

  // 3. Live Bus Marker (Clean, no distracting ping circles or floating text labels)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const busCoord = telemetry.currentCoord;

    if (!busMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-foreground text-background border-2 border-background shadow-lg flex items-center justify-center font-mono font-bold text-xs transform transition-transform" id="driver-bus-icon">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      `;

      busMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(busCoord)
        .addTo(map);
    } else {
      busMarkerRef.current.setLngLat(busCoord);
      const icon = document.getElementById('driver-bus-icon');
      if (icon) {
        icon.style.transform = `rotate(${telemetry.heading}deg)`;
      }
    }
  }, [telemetry.currentCoord, telemetry.heading]);

  const handleRecenter = () => {
    if (mapRef.current && telemetry.currentCoord) {
      mapRef.current.flyTo({
        center: telemetry.currentCoord,
        zoom: 14,
        pitch: 30,
        speed: 1.2,
      });
    }
  };

  const handleFitRoute = () => {
    if (mapRef.current && route.coordinates.length > 1) {
      const bounds = route.coordinates.reduce(
        (acc, coord) => acc.extend(coord),
        new maplibregl.LngLatBounds(route.coordinates[0], route.coordinates[0])
      );
      mapRef.current.fitBounds(bounds, { padding: 40, duration: 800 });
    }
  };

  return (
    <div className="relative w-full h-full bg-card overflow-hidden select-none border border-border">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left: Minimal Route Chip */}
      <div className="absolute top-3 left-3 z-10 bg-card/95 backdrop-blur border border-border px-3 py-1.5 rounded shadow-sm text-foreground flex items-center gap-2">
        <span className="font-mono font-black text-xs px-1.5 py-0.5 bg-foreground text-background rounded-sm">
          {route.code}
        </span>
        <span className="font-semibold text-xs text-foreground tracking-tight">
          {route.name}
        </span>
      </div>

      {/* Top Right: Simple HUD Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleRecenter}
          className="p-2 bg-card/95 hover:bg-accent border border-border text-foreground rounded shadow-sm transition-all cursor-pointer"
          title="Recenter on Bus"
        >
          <Target className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitRoute}
          className="p-2 bg-card/95 hover:bg-accent border border-border text-foreground rounded shadow-sm transition-all cursor-pointer"
          title="Fit Full Route"
        >
          <RouteIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom HUD: Next Stop & Telemetry */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-card/95 backdrop-blur border border-border p-3 rounded shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Next Stop Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center border border-border text-foreground shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-mono block">
              Next Stop
            </span>
            <span className="font-bold text-foreground text-sm leading-tight">
              {telemetry.nextStopName}
            </span>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-2.5 py-1 bg-secondary rounded border border-border">
            <span className="text-muted-foreground text-[10px] mr-1">ETA:</span>
            <strong className="text-foreground">{telemetry.nextStopEtaMinutes} min</strong>
          </div>

          <div className="px-2.5 py-1 bg-secondary rounded border border-border">
            <span className="text-muted-foreground text-[10px] mr-1">DIST:</span>
            <strong className="text-foreground">{telemetry.distanceToNextStopM} m</strong>
          </div>

          <div className="px-2.5 py-1 bg-secondary rounded border border-border">
            <span className="text-muted-foreground text-[10px] mr-1">SPEED:</span>
            <strong className="text-foreground">{telemetry.speedKmH} km/h</strong>
          </div>

          <div className="px-2.5 py-1 bg-secondary rounded border border-border">
            <span className="text-muted-foreground text-[10px] mr-1">STATUS:</span>
            <strong className="text-foreground">{telemetry.status.replace('_', ' ')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
