import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  Activity, 
  Route as RouteIcon,
  Sparkles, 
  X, 
  RotateCcw,
  Bus,
  AlertTriangle
} from 'lucide-react';
import { DEPOTS, RELIEF_POINTS } from './operationsData';

export default function CockpitMapCanvas({
  routes = [],
  buses = [],
  conflicts = [],
  selectedRouteId,
  onSelectRoute,
  hoveredRouteId,
  onHoverRoute,
  selectedBusId,
  onSelectBus,
  selectedDuty,
  onShowToast,
  corridorOverlapPct = 18.4,
  isSimulating = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routesLayer: null,
    conflictLayer: null,
    busesLayer: null,
    hubsLayer: null,
    trafficLayer: null
  });

  const [showTraffic, setShowTraffic] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const [selectedConflictZone, setSelectedConflictZone] = useState(null);

  // Initialize Leaflet Map with Clean Light / Neutral Positron Theme
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6320, 77.2280], // Delhi Central / Connaught Place / Mandi House Corridor
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Clean, low-contrast, non-distracting map tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'minimal-osm-tiles'
      }).addTo(map);

      // Layer groups
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.conflictLayer = L.layerGroup().addTo(map);
      layersRef.current.hubsLayer = L.layerGroup().addTo(map);
      layersRef.current.busesLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Routes and Conflict Overlap Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.routesLayer) return;

    layersRef.current.routesLayer.clearLayers();
    layersRef.current.conflictLayer.clearLayers();

    if (showAllRoutes) {
      routes.forEach(route => {
        const isSelected = selectedRouteId === route.id || (selectedDuty && selectedDuty.routeId === route.id);
        const isHovered = hoveredRouteId === route.id;
        const hasConflict = conflicts.some(c => c.status === 'ACTIVE' && (c.affectedRouteId === route.id || c.overlappingRouteId === route.id));

        const polyline = L.polyline(route.coordinates, {
          color: hasConflict ? '#EF4444' : (isSelected ? '#7C69A5' : route.color || '#4F46E5'),
          weight: isSelected ? 5.5 : (isHovered ? 4.5 : 3),
          opacity: isSelected || isHovered ? 1 : 0.7,
          className: 'transition-all duration-150'
        });

        polyline.on('click', () => {
          if (onSelectRoute) onSelectRoute(route.id);
        });

        if (onHoverRoute) {
          polyline.on('mouseover', () => onHoverRoute(route.id));
          polyline.on('mouseout', () => onHoverRoute(null));
        }

        polyline.bindTooltip(`
          <div class="px-2.5 py-1.5 bg-white text-slate-800 text-xs border border-slate-200 rounded-lg font-mono shadow-md">
            <strong>${route.code || route.id}</strong>: ${route.name}
            <div class="text-[10px] text-slate-500 mt-0.5">${route.activeBuses || 3} buses • ${route.distanceKm || 28.5} km</div>
          </div>
        `, { sticky: true });

        layersRef.current.routesLayer.addLayer(polyline);
      });
    }

    // Overlap Zone
    const activeOverlapConflict = conflicts.find(c => c.status === 'ACTIVE' && c.type === 'CORRIDOR_OVERLAP');
    if (activeOverlapConflict) {
      const overlapCoords = [
        [28.6295, 77.2340],
        [28.6300, 77.2450],
        [28.6200, 77.2480]
      ];

      const overlapLine = L.polyline(overlapCoords, {
        color: '#EF4444',
        weight: 6,
        opacity: 0.9,
        dashArray: '6, 6'
      });

      overlapLine.on('click', () => {
        setSelectedConflictZone({
          title: 'Route 42 ╳ Route 17 Corridor Overlap',
          routes: 'R42 & R17',
          distance: '4.82 km',
          overlapPct: `${corridorOverlapPct}%`,
          affectedStops: ['Mandi House', 'Tilak Bridge', 'ITO Junction Hub'],
          departuresAtRisk: 2,
          recommendation: 'Shift departure by +8 min'
        });
      });

      layersRef.current.conflictLayer.addLayer(overlapLine);
    }
  }, [routes, conflicts, selectedRouteId, hoveredRouteId, selectedDuty, corridorOverlapPct, showAllRoutes]);

  // Render Depots & Relief Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.hubsLayer) return;

    layersRef.current.hubsLayer.clearLayers();

    DEPOTS.forEach(depot => {
      const icon = L.divIcon({
        className: 'custom-depot-marker',
        html: `
          <div class="flex items-center justify-center w-6 h-6 rounded-md bg-slate-800 text-white shadow-md border border-white text-[8px] font-mono font-bold hover:scale-110 transition-transform">
            DEP
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([depot.lat, depot.lng], { icon });
      marker.bindTooltip(`
        <div class="p-2 bg-white text-slate-800 text-xs border border-slate-200 rounded font-sans shadow-md">
          <div class="font-bold text-slate-900">${depot.name}</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Capacity: ${depot.capacity} buses</div>
        </div>
      `);
      layersRef.current.hubsLayer.addLayer(marker);
    });

    RELIEF_POINTS.forEach(rp => {
      const icon = L.divIcon({
        className: 'custom-relief-marker',
        html: `
          <div class="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white shadow-md border border-white text-[8px] font-mono font-bold hover:scale-110 transition-transform">
            RP
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([rp.lat, rp.lng], { icon });
      marker.bindTooltip(`
        <div class="p-2 bg-white text-slate-800 text-xs border border-slate-200 rounded font-sans shadow-md">
          <div class="font-bold text-emerald-700">${rp.name}</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">Rest Lounge & Crew Relief</div>
        </div>
      `);
      layersRef.current.hubsLayer.addLayer(marker);
    });
  }, []);

  // Render Compact Bus Markers (Section 9: Green, Amber, Red, Purple Selected)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.busesLayer) return;

    layersRef.current.busesLayer.clearLayers();

    buses.forEach(bus => {
      const isSelected = selectedBusId === bus.id || (selectedDuty && selectedDuty.busId === bus.id);
      const isDelayed = bus.status === 'DELAYED' || bus.delayMinutes > 0;
      const isCritical = conflicts.some(c => c.status === 'ACTIVE' && c.affectedBusId === bus.id);

      // Section 9 Colors
      const markerColor = isCritical ? '#EF4444' : isDelayed ? '#F59E0B' : '#10B981';
      const labelText = bus.id.replace('BUS-', '');

      const icon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-all duration-200 ${isSelected ? 'scale-125 z-40' : 'hover:scale-110'}">
            <div 
              class="w-7 h-7 rounded-full shadow-md flex items-center justify-center font-mono font-bold text-[10px]"
              style="
                background-color: #FFFFFF;
                border: ${isSelected ? '3px solid #7C69A5' : `2px solid ${markerColor}`};
                color: #1E1B26;
                box-shadow: ${isSelected ? '0 0 0 3px rgba(124, 105, 165, 0.35)' : '0 2px 4px rgba(0,0,0,0.1)'};
              "
            >
              ${labelText}
            </div>
            ${isCritical ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>' : ''}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([bus.lat, bus.lng], { icon });

      marker.on('click', () => {
        if (onSelectBus) onSelectBus(bus.id);
      });

      marker.bindTooltip(`
        <div class="p-2.5 bg-white text-slate-800 text-xs border border-slate-200 rounded-xl font-mono shadow-xl min-w-[170px]">
          <div class="flex items-center justify-between border-b border-slate-100 pb-1 mb-1">
            <strong class="text-slate-900">${bus.id}</strong>
            <span class="text-[9px] px-1.5 py-0.2 rounded font-bold ${
              isCritical ? 'bg-rose-100 text-rose-700' : isDelayed ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }">
              ${isCritical ? 'CRITICAL' : isDelayed ? 'DELAYED' : 'IN_SERVICE'}
            </span>
          </div>
          <div class="space-y-0.5 text-[11px] text-slate-600">
            <div>Driver: <span class="text-slate-900 font-bold">${bus.driverId || 'Rajesh K.'}</span></div>
            <div>Route: <span class="text-indigo-600 font-bold">${bus.routeId || 'R534'}</span></div>
            <div>Speed: <span class="text-slate-900 font-bold">${bus.speedKmh || 28} km/h</span></div>
          </div>
        </div>
      `, { sticky: true });

      layersRef.current.busesLayer.addLayer(marker);
    });
  }, [buses, selectedBusId, selectedDuty, conflicts]);

  // Map Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleLocateCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([28.6320, 77.2280], 13);
      if (onShowToast) onShowToast('Centered on Central Operations Corridor');
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-card rounded-xl border border-border overflow-hidden shadow-xs relative select-none">
      
      {/* Proper Map Header (Section 8) */}
      <div className="h-10 px-3 bg-[#FAF9FC] dark:bg-[#201E2B] border-b border-border flex items-center justify-between shrink-0 font-sans text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-xs text-foreground tracking-tight">LIVE NETWORK</span>
          </div>

          <span className="text-muted-foreground/50">•</span>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold">
            ● Simulation Mode
          </span>
        </div>

        {/* Telemetry Summary */}
        <div className="hidden sm:flex items-center space-x-2 font-mono text-[11px] text-muted-foreground">
          <span><strong>142</strong> Active Buses</span>
          <span>•</span>
          <span><strong>87</strong> Routes</span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">3 Delays</span>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="flex-1 relative min-h-0">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Compact Map Control Deck (Section 8: +, −, Locate, Layers, Traffic, Routes) */}
        <div className="absolute top-3 right-3 z-30 flex flex-col space-y-1.5 shadow-md">
          <div className="bg-card border border-border rounded-lg p-0.5 flex flex-col space-y-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-muted text-foreground transition cursor-pointer"
              title="Zoom In (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="h-px bg-border my-0.5" />
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-muted text-foreground transition cursor-pointer"
              title="Zoom Out (−)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="h-px bg-border my-0.5" />
            <button
              onClick={handleLocateCenter}
              className="p-1.5 rounded hover:bg-muted text-foreground transition cursor-pointer"
              title="Recenter Map"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-0.5 flex flex-col space-y-0.5 text-[10px] font-mono">
            <button
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className={`px-2 py-1 rounded transition cursor-pointer flex items-center space-x-1 ${
                showAllRoutes ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Toggle Route Polylines"
            >
              <RouteIcon className="w-3 h-3" />
              <span className="hidden md:inline">Routes</span>
            </button>

            <button
              onClick={() => {
                setShowTraffic(!showTraffic);
                if (onShowToast) onShowToast(`Traffic Congestion Layer: ${!showTraffic ? 'ON' : 'OFF'}`);
              }}
              className={`px-2 py-1 rounded transition cursor-pointer flex items-center space-x-1 ${
                showTraffic ? 'bg-amber-500/15 text-amber-600 font-bold' : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Toggle Traffic Layer"
            >
              <Activity className="w-3 h-3" />
              <span className="hidden md:inline">Traffic</span>
            </button>
          </div>
        </div>

        {/* Compact Legend Pill at Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-30 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-xs border border-border text-[10px] font-mono text-muted-foreground flex items-center space-x-3 shadow-xs">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-foreground font-medium">Normal</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-foreground font-medium">Delayed</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-foreground font-medium">Critical</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full border-2 border-primary" />
            <span className="text-foreground font-medium">Selected</span>
          </span>
        </div>

        {/* Overlap Inspection Modal */}
        {selectedConflictZone && (
          <div className="absolute bottom-3 right-3 z-40 w-72 rounded-xl bg-card border border-border shadow-xl p-3.5 text-xs font-sans animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2 text-rose-600 font-bold">
              <span className="flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Corridor Overlap Detected</span>
              </span>
              <button onClick={() => setSelectedConflictZone(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-muted-foreground">
              <div>Corridor: <strong className="text-foreground">{selectedConflictZone.routes}</strong></div>
              <div>Overlap: <strong className="text-rose-500">{selectedConflictZone.overlapPct}</strong></div>
              <div>Buffer: <strong className="text-foreground">50m PostGIS Validated</strong></div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
