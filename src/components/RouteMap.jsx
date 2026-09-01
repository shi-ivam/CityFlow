import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Pencil, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  Sparkles, 
  Compass, 
  Eye, 
  Info,
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';
import { 
  calculateRouteLength, 
  createCorridorBuffer, 
  detectRouteOverlap 
} from '../utils/gisCalculations';
import { PROPOSED_ROUTE_TEMPLATES } from '../data/transitData';

export default function RouteMap({
  routes,
  interchangeHubs,
  busFleet,
  dutyAssignments,
  operationalTime,
  selectedRouteId,
  onSelectRoute,
  hoveredRouteId,
  onHoverRoute,
  onCommitNewRoute,
  isDrawingMode,
  setIsDrawingMode,
  drawnCoordinates,
  setDrawnCoordinates,
  overlapReport,
  setOverlapReport
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routesLayer: null,
    buffersLayer: null,
    hubsLayer: null,
    busesLayer: null,
    drawingLayer: null,
    overlapLayer: null
  });

  const [showBuffers, setShowBuffers] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showHubs, setShowHubs] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on San Francisco metro grid
      const map = L.map(mapContainerRef.current, {
        center: [37.7650, -122.4200],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // Add high contrast dark OpenStreetMap tile layer with custom styling
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'dark-osm-tiles'
      }).addTo(map);

      // Add custom zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create Layer Groups
      layersRef.current.buffersLayer = L.layerGroup().addTo(map);
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.overlapLayer = L.layerGroup().addTo(map);
      layersRef.current.drawingLayer = L.layerGroup().addTo(map);
      layersRef.current.hubsLayer = L.layerGroup().addTo(map);
      layersRef.current.busesLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    // Auto-invalidate size on mount and resize
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, []);

  // Invalidate map size on window/container resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle map clicks when in drawing mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (!isDrawingMode) return;
      const { lat, lng } = e.latlng;
      const newCoords = [...drawnCoordinates, [Number(lng.toFixed(5)), Number(lat.toFixed(5))]];
      setDrawnCoordinates(newCoords);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode, drawnCoordinates, setDrawnCoordinates]);

  // Recalculate overlap whenever drawn coordinates change
  useEffect(() => {
    if (drawnCoordinates.length >= 2) {
      const report = detectRouteOverlap(drawnCoordinates, routes, 50);
      setOverlapReport(report);
    } else {
      setOverlapReport(null);
    }
  }, [drawnCoordinates, routes, setOverlapReport]);

  // Render Routes and 50m Buffers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.routesLayer) return;

    layersRef.current.routesLayer.clearLayers();
    layersRef.current.buffersLayer.clearLayers();

    routes.forEach(route => {
      if (!route.pathCoordinates || route.pathCoordinates.length < 2) return;
      const latLngs = route.pathCoordinates.map(coord => [coord[1], coord[0]]); // [lat, lng]

      const isSelected = selectedRouteId === route.id;
      const isHovered = hoveredRouteId === route.id;

      // 1. Draw 50-meter corridor buffer polygon
      if (showBuffers) {
        const bufferGeoJSON = createCorridorBuffer(route.pathCoordinates, 50);
        if (bufferGeoJSON) {
          const bufferLayer = L.geoJSON(bufferGeoJSON, {
            style: {
              color: route.color || '#0ea5e9',
              weight: 1,
              opacity: isSelected ? 0.8 : 0.3,
              fillColor: route.color || '#0ea5e9',
              fillOpacity: isSelected ? 0.25 : isHovered ? 0.2 : 0.08,
              dashArray: '4, 4'
            }
          });
          layersRef.current.buffersLayer.addLayer(bufferLayer);
        }
      }

      // 2. Draw Route Polyline
      const polyline = L.polyline(latLngs, {
        color: route.color || '#0ea5e9',
        weight: isSelected ? 6 : isHovered ? 5 : 3.5,
        opacity: isSelected ? 1 : isHovered ? 0.95 : 0.75,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Hover and Click interactions
      polyline.on('mouseover', () => onHoverRoute && onHoverRoute(route.id));
      polyline.on('mouseout', () => onHoverRoute && onHoverRoute(null));
      polyline.on('click', () => onSelectRoute && onSelectRoute(selectedRouteId === route.id ? null : route.id));

      // Tooltip popup
      polyline.bindTooltip(`
        <div class="p-1 font-sans">
          <div class="font-bold text-xs text-white flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${route.color}"></span>
            <span>Route ${route.code} — ${route.name}</span>
          </div>
          <div class="text-[10px] text-slate-300 font-mono mt-0.5">
            ${route.lengthKm} km • ${route.frequencyMins}m Frequency • 50m Corridor
          </div>
        </div>
      `, { sticky: true, className: 'leaflet-dark-tooltip' });

      layersRef.current.routesLayer.addLayer(polyline);

      // Route start/end terminal dots
      if (latLngs.length > 0) {
        const startPoint = latLngs[0];
        const endPoint = latLngs[latLngs.length - 1];

        [startPoint, endPoint].forEach((pt, idx) => {
          const terminalMarker = L.circleMarker(pt, {
            radius: isSelected ? 5 : 4,
            fillColor: route.color,
            fillOpacity: 1,
            color: '#ffffff',
            weight: 1.5
          });
          layersRef.current.routesLayer.addLayer(terminalMarker);
        });
      }
    });
  }, [routes, selectedRouteId, hoveredRouteId, showBuffers, onSelectRoute, onHoverRoute]);

  // Render Interchange Hubs
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.hubsLayer) return;

    layersRef.current.hubsLayer.clearLayers();

    if (!showHubs) return;

    interchangeHubs.forEach(hub => {
      const [lng, lat] = hub.coordinates;

      // Custom HTML Icon for Hub
      const hubIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: `
          <div class="relative flex items-center justify-center group cursor-pointer">
            <div class="absolute w-7 h-7 rounded-full bg-purple-500/30 animate-ping"></div>
            <div class="w-6 h-6 rounded-lg bg-[#0c1424] border-2 border-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/40 text-purple-300 font-bold text-[9px] font-mono">
              HUB
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: hubIcon });

      marker.bindPopup(`
        <div class="p-2 font-sans space-y-1.5 min-w-[200px]">
          <div class="flex items-center justify-between border-b border-purple-500/30 pb-1">
            <span class="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">${hub.code}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">15m Handoff Hub</span>
          </div>
          <div class="font-bold text-sm text-white">${hub.name}</div>
          <p class="text-xs text-slate-300">${hub.description}</p>
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Bays: <strong class="text-white">${hub.bayCount}</strong></span>
            <span>Active Swaps: <strong class="text-amber-400">${hub.activeTransfers}</strong></span>
          </div>
        </div>
      `);

      layersRef.current.hubsLayer.addLayer(marker);
    });
  }, [interchangeHubs, showHubs]);

  // Render Animated Live Buses
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.busesLayer) return;

    layersRef.current.busesLayer.clearLayers();

    if (!showBuses) return;

    // Position each active bus along its assigned route according to operational time
    busFleet.forEach((bus, index) => {
      if (!bus.assignedRoute || bus.status !== 'IN_SERVICE') return;
      const route = routes.find(r => r.code === bus.assignedRoute);
      if (!route || !route.pathCoordinates || route.pathCoordinates.length < 2) return;

      // Calculate pseudo-progress along route based on operationalTime
      const totalPoints = route.pathCoordinates.length;
      const progressFactor = ((operationalTime * 0.1) + (index * 2.5)) % (totalPoints - 1);
      const baseIndex = Math.floor(progressFactor);
      const frac = progressFactor - baseIndex;

      const p1 = route.pathCoordinates[baseIndex];
      const p2 = route.pathCoordinates[Math.min(totalPoints - 1, baseIndex + 1)];

      const currentLng = p1[0] + (p2[0] - p1[0]) * frac;
      const currentLat = p1[1] + (p2[1] - p1[1]) * frac;

      // Find active duty for this bus
      const activeDuty = dutyAssignments.find(d => d.busId === bus.id);

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute w-5 h-5 rounded-full ${activeDuty?.dutyType === 'UNLINKED' ? 'bg-amber-400/40' : 'bg-sky-400/40'} bus-ping-circle"></div>
            <div class="w-5 h-5 rounded-md ${activeDuty?.dutyType === 'UNLINKED' ? 'bg-amber-500' : 'bg-sky-500'} border border-white text-white flex items-center justify-center shadow-lg font-mono text-[9px] font-bold">
              ${bus.busNumber.replace('EV-', '')}
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([currentLat, currentLng], { icon: busIcon });
      
      marker.bindTooltip(`
        <div class="p-1 font-mono text-xs">
          <div class="font-bold text-white">${bus.busNumber} (${bus.type})</div>
          <div class="text-slate-300">Route ${route.code} • Batt: ${bus.batteryPct}%</div>
          <div class="text-[10px] ${activeDuty?.dutyType === 'UNLINKED' ? 'text-amber-400' : 'text-sky-400'} font-bold">
            ${activeDuty ? `${activeDuty.dutyType} DUTY` : 'AVAILABLE'}
          </div>
        </div>
      `, { sticky: true });

      layersRef.current.busesLayer.addLayer(marker);
    });
  }, [busFleet, routes, dutyAssignments, operationalTime, showBuses]);

  // Render Drawing Layer & Overlap Visuals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.drawingLayer) return;

    layersRef.current.drawingLayer.clearLayers();
    layersRef.current.overlapLayer.clearLayers();

    if (drawnCoordinates.length === 0) return;

    const latLngs = drawnCoordinates.map(c => [c[1], c[0]]);

    // 1. Draw 50m buffer around drawn proposed route
    if (drawnCoordinates.length >= 2) {
      const propBuffer = createCorridorBuffer(drawnCoordinates, 50);
      if (propBuffer) {
        const propBufferLayer = L.geoJSON(propBuffer, {
          style: {
            color: overlapReport?.overlapPercentage > 40 ? '#f43f5e' : '#06b6d4',
            weight: 1.5,
            opacity: 0.8,
            fillColor: overlapReport?.overlapPercentage > 40 ? '#f43f5e' : '#06b6d4',
            fillOpacity: 0.2,
            dashArray: '5, 5'
          }
        });
        layersRef.current.drawingLayer.addLayer(propBufferLayer);
      }
    }

    // 2. Draw proposed polyline
    const propPolyline = L.polyline(latLngs, {
      color: overlapReport?.overlapPercentage > 40 ? '#f43f5e' : '#06b6d4',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.95
    });
    layersRef.current.drawingLayer.addLayer(propPolyline);

    // 3. Draw waypoint markers
    drawnCoordinates.forEach((coord, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === drawnCoordinates.length - 1;

      const wpMarker = L.circleMarker([coord[1], coord[0]], {
        radius: isStart || isEnd ? 6 : 4,
        fillColor: isStart ? '#10b981' : isEnd ? '#f43f5e' : '#06b6d4',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2
      });

      wpMarker.bindTooltip(`Waypoint ${idx + 1}: [${coord[0]}, ${coord[1]}]`);
      layersRef.current.drawingLayer.addLayer(wpMarker);
    });

    // 4. Highlight shared overlap intersection points
    if (overlapReport?.intersections) {
      overlapReport.intersections.forEach((cross, idx) => {
        const [xLng, xLat] = cross.coordinates;
        const xMarker = L.circleMarker([xLat, xLng], {
          radius: 8,
          fillColor: '#f43f5e',
          fillOpacity: 0.8,
          color: '#ffffff',
          weight: 2
        });
        xMarker.bindPopup(`
          <div class="p-1 font-mono text-xs text-rose-300">
            <strong class="text-white">Corridor Intersection Point</strong><br/>
            Crosses Route ${cross.routeCode} (${cross.routeName})
          </div>
        `);
        layersRef.current.overlapLayer.addLayer(xMarker);
      });
    }

  }, [drawnCoordinates, overlapReport]);

  // Handler for preset templates
  const loadPresetRoute = (template) => {
    setDrawnCoordinates(template.pathCoordinates);
    setIsDrawingMode(true);
  };

  const clearDrawing = () => {
    setDrawnCoordinates([]);
    setOverlapReport(null);
  };

  const commitProposedRoute = () => {
    if (drawnCoordinates.length < 2) return;
    const lengthKm = calculateRouteLength(drawnCoordinates);
    const newRoute = {
      id: `route-custom-${Date.now()}`,
      code: `${Math.floor(500 + Math.random() * 400)}`,
      name: `Proposed Express Link ${drawnCoordinates.length}W`,
      color: '#06b6d4',
      lengthKm,
      frequencyMins: 15,
      operatingHours: "06:00 - 22:00",
      bufferMeters: 50,
      stops: drawnCoordinates.map((c, i) => ({ name: `Waypoint ${i + 1}`, coordinates: c })),
      pathCoordinates: drawnCoordinates
    };

    onCommitNewRoute(newRoute);
    clearDrawing();
    setIsDrawingMode(false);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 flex flex-col overflow-hidden bg-[#060913]">
      
      {/* Map Header Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Layer Toggles & Mode Indicator */}
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-xl pointer-events-auto">
          
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isDrawingMode 
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-white/30 animate-pulse'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? 'Drawing Active (Click Map)' : 'Draw Proposed Route'}</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5"></div>

          {/* 50m Buffer Layer Toggle */}
          <button
            onClick={() => setShowBuffers(!showBuffers)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition ${
              showBuffers ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle 50-meter corridor buffers"
          >
            50m Buffer
          </button>

          {/* Hubs Layer Toggle */}
          <button
            onClick={() => setShowHubs(!showHubs)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition ${
              showHubs ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Interchange Transfer Hubs"
          >
            Hubs (15m)
          </button>

          {/* Live Buses Toggle */}
          <button
            onClick={() => setShowBuses(!showBuses)}
            className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition ${
              showBuses ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Live Bus Fleet Trackers"
          >
            Live Buses
          </button>
        </div>

        {/* Right: Quick Preset Loaders */}
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-xl pointer-events-auto text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase font-bold pl-1 hidden lg:inline">Test Scenarios:</span>
          
          <button
            onClick={() => loadPresetRoute(PROPOSED_ROUTE_TEMPLATES[0])}
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition text-[11px]"
            title="Load Midtown Radial (58% corridor overlap with Route 101)"
          >
            <span className="font-bold">Scenario A:</span> High Overlap (58%)
          </button>

          <button
            onClick={() => loadPresetRoute(PROPOSED_ROUTE_TEMPLATES[1])}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition text-[11px]"
            title="Load South Waterfront Connector (8% overlap, independent corridor)"
          >
            <span className="font-bold">Scenario B:</span> Clean Route (8%)
          </button>
        </div>

      </div>

      {/* Main Leaflet Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] flex-1 z-10" />

      {/* Drawing Toolbar Overlay & Overlap Conflict HUD */}
      {isDrawingMode && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-[#0c1424]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl space-y-3">
          
          {/* Header & Waypoint Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Interactive Route Placer</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                    {drawnCoordinates.length} Waypoints Placed
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Click on the map to add nodes. The PostGIS overlap solver tests spatial buffer & timetable clashes instantly.
                </p>
              </div>
            </div>

            {/* Actions: Undo, Clear, Commit */}
            <div className="flex items-center space-x-2">
              <button
                onClick={clearDrawing}
                disabled={drawnCoordinates.length === 0}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-mono transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                onClick={commitProposedRoute}
                disabled={drawnCoordinates.length < 2}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Commit to Active Network</span>
              </button>
            </div>
          </div>

          {/* Real-time Overlap Analysis Results */}
          {overlapReport && drawnCoordinates.length >= 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              
              {/* Overlap Percentage & Congestion Badge (4 cols) */}
              <div className={`md:col-span-4 p-3 rounded-xl border flex flex-col justify-between ${
                overlapReport.overlapPercentage > 40
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-inner'
                  : overlapReport.overlapPercentage >= 15
                  ? 'bg-amber-950/40 border-amber-500/50 shadow-inner'
                  : 'bg-emerald-950/40 border-emerald-500/50 shadow-inner'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">Corridor Overlap Metric</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      overlapReport.overlapPercentage > 40
                        ? 'bg-rose-500 text-white'
                        : overlapReport.overlapPercentage >= 15
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {overlapReport.congestionLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className={`text-2xl font-display font-black ${
                      overlapReport.overlapPercentage > 40 ? 'text-rose-400' : overlapReport.overlapPercentage >= 15 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {overlapReport.overlapPercentage}%
                    </span>
                    <span className="text-xs text-slate-300 font-mono">({overlapReport.totalOverlapKm} km / {overlapReport.proposedLengthKm} km)</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 mt-2 font-mono leading-relaxed">
                  {overlapReport.summary}
                </div>
              </div>

              {/* Shared Corridors & Conflict List (8 cols) */}
              <div className="md:col-span-8 bg-slate-900/90 rounded-xl border border-white/10 p-3 space-y-2 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/5 pb-1">
                  <span>Detected Shared Segments (50m Buffer)</span>
                  <span>Crossings: <strong className="text-white">{overlapReport.intersections.length}</strong></span>
                </div>

                {overlapReport.sharedCorridors.length > 0 ? (
                  <div className="space-y-1.5">
                    {overlapReport.sharedCorridors.map((corridor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-white/5 text-xs font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">Route {corridor.existingRouteCode}</span>
                          <span className="text-white truncate max-w-[200px]">{corridor.existingRouteName}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-slate-300">
                          <span>{corridor.overlapLengthKm} km shared</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            corridor.risk === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {corridor.risk} RISK
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-mono py-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Independent alignment! Zero high-risk corridor collision detected.</span>
                  </div>
                )}

                {/* Timetable Clash Alert */}
                {overlapReport.temporalClashes.length > 0 && (
                  <div className="mt-1 p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Temporal Headway Conflict:</span> {overlapReport.temporalClashes[0].headwayRisk}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-xs font-mono text-slate-400 py-2 text-center">
              Click at least 2 points on the map to begin real-time spatial conflict & corridor buffer analysis.
            </div>
          )}

        </div>
      )}

      {/* Map Legend (Bottom Right) */}
      {!isDrawingMode && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl text-[11px] font-mono space-y-1.5 hidden sm:block">
          <div className="font-bold text-slate-300 border-b border-white/10 pb-1">Network GIS Legend</div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-sky-400 rounded"></span>
            <span className="text-slate-300">Route 101 Airport</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-emerald-400 rounded"></span>
            <span className="text-slate-300">Route 204 Spine</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-purple-400 rounded"></span>
            <span className="text-slate-300">Route 305 Ring</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded bg-purple-500 border border-white"></span>
            <span className="text-slate-300">Interchange Hub (15m)</span>
          </div>
        </div>
      )}

    </div>
  );
}
