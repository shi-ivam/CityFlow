import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Pencil, 
  Trash2, 
  Compass, 
  Layers, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  X, 
  Bus,
  Magnet,
  Maximize2
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
  corridorOverlapPct = 18.4
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routesLayer: null,
    conflictLayer: null,
    busesLayer: null,
    hubsLayer: null,
    drawnLayer: null
  });

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [snapToRoad, setSnapToRoad] = useState(true);
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [showOverlapHUD, setShowOverlapHUD] = useState(false);
  const [selectedConflictZone, setSelectedConflictZone] = useState(null);

  // Initialize Leaflet Map with Dark Theme
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6320, 77.2280], // Delhi Central / Connaught Place / ITO Corridor
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Watermark-free Dark Control-Room Geospatial Map Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'cockpit-dark-tiles'
      }).addTo(map);

      // Custom Zoom Control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Layer groups
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.conflictLayer = L.layerGroup().addTo(map);
      layersRef.current.hubsLayer = L.layerGroup().addTo(map);
      layersRef.current.busesLayer = L.layerGroup().addTo(map);
      layersRef.current.drawnLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks for drawing mode
      map.on('click', (e) => {
        if (!isDrawingMode) return;
        const newPt = [e.latlng.lat, e.latlng.lng];
        setDrawnPoints(prev => {
          const next = [...prev, newPt];
          if (next.length >= 2) {
            setShowOverlapHUD(true);
          }
          return next;
        });
      });
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);

    return () => clearTimeout(timer);
  }, [isDrawingMode]);

  // Render Routes and Conflict Overlap Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.routesLayer) return;

    layersRef.current.routesLayer.clearLayers();
    layersRef.current.conflictLayer.clearLayers();

    routes.forEach(route => {
      const isSelected = selectedRouteId === route.id || (selectedDuty && selectedDuty.routeId === route.id);
      const isHovered = hoveredRouteId === route.id;
      const hasConflict = conflicts.some(c => c.status === 'ACTIVE' && (c.affectedRouteId === route.id || c.overlappingRouteId === route.id));

      const polyline = L.polyline(route.coordinates, {
        color: hasConflict ? (isSelected ? '#ef4444' : route.color) : route.color,
        weight: isSelected ? 6 : (isHovered ? 5 : 3.5),
        opacity: isSelected || isHovered ? 1 : 0.75,
        dashArray: null,
        className: 'transition-all duration-200'
      });

      polyline.on('click', () => {
        onSelectRoute(route.id);
      });

      polyline.on('mouseover', () => {
        onHoverRoute(route.id);
      });

      polyline.on('mouseout', () => {
        onHoverRoute(null);
      });

      polyline.bindTooltip(`
        <div class="px-2 py-1 bg-[#111827] text-white text-xs border border-[#1f2937] rounded font-mono shadow-xl">
          <strong style="color: ${route.color}">${route.id}</strong>: ${route.name}
          <div class="text-[10px] text-slate-400 mt-0.5">${route.activeBuses} active buses • ${route.lengthKm} km</div>
        </div>
      `, { sticky: true, className: 'leaflet-dark-tooltip' });

      layersRef.current.routesLayer.addLayer(polyline);
    });

    // Render Overlap Zone: R42 ⇄ R17 Corridor along ITO / Mandi House
    const activeOverlapConflict = conflicts.find(c => c.status === 'ACTIVE' && c.type === 'CORRIDOR_OVERLAP');
    if (activeOverlapConflict) {
      const overlapCoords = [
        [28.6295, 77.2340], // Mandi House
        [28.6300, 77.2450], // ITO Junction
        [28.6200, 77.2480]  // Pragati Maidan
      ];

      const overlapLine = L.polyline(overlapCoords, {
        color: '#ef4444',
        weight: 7,
        opacity: 0.95,
        dashArray: '8, 8',
        className: 'animate-pulse'
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

      overlapLine.bindTooltip(`
        <div class="px-2.5 py-1.5 bg-rose-950/90 text-rose-200 text-xs border border-rose-600 rounded font-mono shadow-2xl">
          <div class="font-bold text-white flex items-center gap-1">⚠️ CORRIDOR OVERLAP ZONE</div>
          <div>Routes: R42 ╳ R17 (${corridorOverlapPct}%)</div>
          <div class="text-[10px] text-rose-300">Click to inspect overlap zone</div>
        </div>
      `, { sticky: true });

      layersRef.current.conflictLayer.addLayer(overlapLine);
    }
  }, [routes, conflicts, selectedRouteId, hoveredRouteId, selectedDuty, corridorOverlapPct]);

  // Render Buses, Depots, and Relief Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.busesLayer || !layersRef.current.hubsLayer) return;

    layersRef.current.busesLayer.clearLayers();
    layersRef.current.hubsLayer.clearLayers();

    // Depots
    DEPOTS.forEach(depot => {
      const icon = L.divIcon({
        className: 'custom-depot-marker',
        html: `
          <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-900/90 border-2 border-indigo-400 text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <span class="text-[9px] font-mono font-bold">DEP</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([depot.lat, depot.lng], { icon });
      marker.bindTooltip(`
        <div class="p-2 bg-[#111827] text-white text-xs border border-[#1f2937] rounded font-sans">
          <div class="font-bold text-indigo-400">${depot.name}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Capacity: ${depot.capacity} • Standby: ${depot.standbyDrivers}</div>
        </div>
      `);
      layersRef.current.hubsLayer.addLayer(marker);
    });

    // Relief Points
    RELIEF_POINTS.forEach(rp => {
      const icon = L.divIcon({
        className: 'custom-relief-marker',
        html: `
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900/90 border-2 border-emerald-400 text-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <span class="text-[8px] font-mono font-bold">RP</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([rp.lat, rp.lng], { icon });
      marker.bindTooltip(`
        <div class="p-2 bg-[#111827] text-white text-xs border border-[#1f2937] rounded font-sans">
          <div class="font-bold text-emerald-400">${rp.name}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Crew Changeover & Rest Lounge</div>
        </div>
      `);
      layersRef.current.hubsLayer.addLayer(marker);
    });

    // Live Buses
    buses.forEach(bus => {
      const isSelected = selectedBusId === bus.id || (selectedDuty && selectedDuty.busId === bus.id);
      const isAffectedByConflict = conflicts.some(c => c.status === 'ACTIVE' && c.affectedBusId === bus.id);

      const color = isAffectedByConflict ? '#ef4444' : (isSelected ? '#6366f1' : '#10b981');

      const icon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-40' : 'hover:scale-110'}">
            <div class="w-8 h-8 rounded-full border-2 shadow-2xl flex items-center justify-center" style="background-color: #111827; border-color: ${color};">
              <span class="text-[9px] font-mono font-bold" style="color: ${color}">
                ${bus.id.replace('BUS-', '')}
              </span>
            </div>
            ${isAffectedByConflict ? '<span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([bus.lat, bus.lng], { icon });

      marker.on('click', () => {
        onSelectBus(bus.id);
      });

      marker.bindTooltip(`
        <div class="p-2.5 bg-[#111827] text-white text-xs border border-[#1f2937] rounded-lg font-mono shadow-2xl min-w-[180px]">
          <div class="flex items-center justify-between border-b border-[#1f2937] pb-1 mb-1.5">
            <strong class="text-white">${bus.id}</strong>
            <span class="text-[9px] px-1.5 py-0.5 rounded ${isAffectedByConflict ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}">
              ${bus.status}
            </span>
          </div>
          <div class="space-y-0.5 text-[11px] text-slate-300">
            <div>Reg: <span class="text-white">${bus.regNumber}</span></div>
            <div>Driver: <span class="text-indigo-300">${bus.driverId || 'None'}</span></div>
            <div>Route: <span class="text-amber-300">${bus.routeId || 'Depot'}</span></div>
            <div>Speed: <span class="text-white">${bus.speedKmh} km/h</span> • Battery: <span class="text-emerald-400">${bus.batteryPct}%</span></div>
          </div>
        </div>
      `, { sticky: true });

      layersRef.current.busesLayer.addLayer(marker);
    });

  }, [buses, selectedBusId, selectedDuty, conflicts]);

  // Render Drawn Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.drawnLayer) return;

    layersRef.current.drawnLayer.clearLayers();

    if (drawnPoints.length > 0) {
      // Line
      if (drawnPoints.length >= 2) {
        const poly = L.polyline(drawnPoints, {
          color: '#38bdf8',
          weight: 4,
          dashArray: '5, 5'
        });
        layersRef.current.drawnLayer.addLayer(poly);
      }

      // Point markers
      drawnPoints.forEach((pt, idx) => {
        const pMarker = L.circleMarker(pt, {
          radius: 5,
          color: '#38bdf8',
          fillColor: '#ffffff',
          fillOpacity: 1
        });
        pMarker.bindTooltip(`<div class="text-[10px] font-mono">WP-${idx + 1}</div>`, { permanent: true, direction: 'top' });
        layersRef.current.drawnLayer.addLayer(pMarker);
      });
    }
  }, [drawnPoints]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#0b0f19] overflow-hidden select-none">
      
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Drawing Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-1.5 p-1 rounded-lg bg-[#111827]/90 backdrop-blur border border-[#1f2937] shadow-xl text-xs font-sans">
        <button
          onClick={() => {
            const nextMode = !isDrawingMode;
            setIsDrawingMode(nextMode);
            if (nextMode) {
              onShowToast('Route Variant Drawing Active: Click map to place waypoints.');
            }
          }}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
            isDrawingMode 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-300 hover:text-white hover:bg-[#1f2937]'
          }`}
          title="Simulate drawing a new route variant"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{isDrawingMode ? 'Drawing Active' : 'Draw Variant'}</span>
        </button>

        <button
          onClick={() => {
            setSnapToRoad(!snapToRoad);
            onShowToast(`Road Snapping: ${!snapToRoad ? 'ENABLED' : 'DISABLED'}`);
          }}
          className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition ${
            snapToRoad 
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
          title="Toggle corridor road-snapping algorithm"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Snap</span>
        </button>

        <button
          onClick={() => {
            setShowOverlapHUD(true);
            onShowToast('Corridor Overlap: Simulated 23.4% overlap on Central Arterial corridor.');
          }}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1f2937] transition"
          title="Calculate spatial overlap against active network"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Calc Overlap</span>
        </button>

        {(drawnPoints.length > 0 || isDrawingMode) && (
          <button
            onClick={() => {
              setDrawnPoints([]);
              setIsDrawingMode(false);
              setShowOverlapHUD(false);
              onShowToast('Cleared temporary route variant.');
            }}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition"
            title="Clear temporary variant"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 px-3 py-2 rounded-lg bg-[#111827]/90 backdrop-blur border border-[#1f2937] text-[11px] font-sans text-slate-300 space-y-1 shadow-2xl hidden sm:block">
        <div className="text-[9px] font-mono uppercase text-slate-400 font-bold tracking-wider mb-1">
          Operations Layer
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span>Nominal Active Bus</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
          <span>Conflict / At-Risk Bus</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-1 border-t-2 border-dashed border-rose-500 inline-block" />
          <span>Corridor Overlap Zone</span>
        </div>
      </div>

      {/* Live Overlap HUD (Section 14) */}
      {showOverlapHUD && (
        <div className="absolute top-14 left-3 z-30 w-72 rounded-xl bg-[#111827]/95 backdrop-blur-md border border-amber-500/40 shadow-2xl p-3.5 text-xs font-sans text-white animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-[12px] tracking-tight">ROUTE VARIANT ANALYSIS</span>
            </div>
            <button
              onClick={() => setShowOverlapHUD(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Distance:</span>
              <span className="font-bold text-white">4.82 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Existing Corridor:</span>
              <span className="font-bold text-amber-400">23.4% overlap</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Affected Stops:</span>
              <span className="font-bold text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Peak Load:</span>
              <span className="font-bold text-emerald-400">82%</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#1f2937]">
              <span className="text-slate-400">Stop Bay Capacity:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                ⚠ WARNING
              </span>
            </div>
          </div>

          <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
            <span className="font-bold">Recommendation:</span> Shift departure by +8 min to avoid stop-bay queueing.
          </div>
        </div>
      )}

      {/* Selected Conflict Zone Modal / Drawer */}
      {selectedConflictZone && (
        <div className="absolute bottom-3 right-3 z-30 w-80 rounded-xl bg-[#111827]/95 backdrop-blur-md border border-rose-500/40 shadow-2xl p-4 text-xs font-sans text-white animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{selectedConflictZone.title}</span>
            </div>
            <button
              onClick={() => setSelectedConflictZone(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Routes Involved:</span>
              <span className="font-bold text-white">{selectedConflictZone.routes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overlap Distance:</span>
              <span className="font-bold text-white">{selectedConflictZone.distance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overlap Percentage:</span>
              <span className="font-bold text-rose-400">{selectedConflictZone.overlapPct}</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-400 block mb-1">Affected Stops:</span>
              <div className="flex flex-wrap gap-1">
                {selectedConflictZone.affectedStops.map(s => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-[#1f2937] text-slate-300 text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-200">
            <strong>Recommended:</strong> {selectedConflictZone.recommendation}
          </div>
        </div>
      )}

    </div>
  );
}
