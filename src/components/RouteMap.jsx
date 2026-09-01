import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Pencil, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
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
      const map = L.map(mapContainerRef.current, {
        center: [37.7650, -122.4200],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      // High-contrast clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'minimal-osm-tiles'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      layersRef.current.buffersLayer = L.layerGroup().addTo(map);
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.overlapLayer = L.layerGroup().addTo(map);
      layersRef.current.drawingLayer = L.layerGroup().addTo(map);
      layersRef.current.hubsLayer = L.layerGroup().addTo(map);
      layersRef.current.busesLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(resizeTimer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map click handler for drawing
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

  // Overlap recalculation
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
      const latLngs = route.pathCoordinates.map(coord => [coord[1], coord[0]]);

      const isSelected = selectedRouteId === route.id;
      const isHovered = hoveredRouteId === route.id;

      // 50m corridor buffer
      if (showBuffers) {
        const bufferGeoJSON = createCorridorBuffer(route.pathCoordinates, 50);
        if (bufferGeoJSON) {
          const bufferLayer = L.geoJSON(bufferGeoJSON, {
            style: {
              color: route.color || '#1F6C9F',
              weight: 1,
              opacity: isSelected ? 0.6 : 0.25,
              fillColor: route.color || '#1F6C9F',
              fillOpacity: isSelected ? 0.15 : isHovered ? 0.12 : 0.05,
              dashArray: '3, 3'
            }
          });
          layersRef.current.buffersLayer.addLayer(bufferLayer);
        }
      }

      // Polyline
      const polyline = L.polyline(latLngs, {
        color: route.color || '#111111',
        weight: isSelected ? 5 : isHovered ? 4 : 3,
        opacity: isSelected ? 1 : isHovered ? 0.9 : 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('mouseover', () => onHoverRoute && onHoverRoute(route.id));
      polyline.on('mouseout', () => onHoverRoute && onHoverRoute(null));
      polyline.on('click', () => onSelectRoute && onSelectRoute(selectedRouteId === route.id ? null : route.id));

      polyline.bindTooltip(`
        <div class="p-1 font-sans">
          <div class="font-bold text-xs text-[#111111] flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${route.color}"></span>
            <span>Route ${route.code} — ${route.name}</span>
          </div>
          <div class="text-[10px] text-[#787774] font-mono mt-0.5">
            ${route.lengthKm} km • ${route.frequencyMins}m Frequency • 50m Buffer
          </div>
        </div>
      `, { sticky: true });

      layersRef.current.routesLayer.addLayer(polyline);

      // Terminal dots
      if (latLngs.length > 0) {
        [latLngs[0], latLngs[latLngs.length - 1]].forEach(pt => {
          const terminalMarker = L.circleMarker(pt, {
            radius: isSelected ? 4 : 3,
            fillColor: route.color,
            fillOpacity: 1,
            color: '#FFFFFF',
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

      const hubIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-5 h-5 rounded-[4px] bg-[#FFFFFF] border-2 border-[#6E3294] flex items-center justify-center shadow-xs text-[#6E3294] font-bold text-[8px] font-mono">
              HUB
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lat, lng], { icon: hubIcon });

      marker.bindPopup(`
        <div class="p-2 font-sans space-y-1 min-w-[180px]">
          <div class="flex items-center justify-between border-b border-[#EAEAEA] pb-1">
            <span class="text-[10px] font-mono font-bold text-[#6E3294]">${hub.code}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#F3EBF9] text-[#6E3294] font-mono">15m Handoff</span>
          </div>
          <div class="font-bold text-xs text-[#111111]">${hub.name}</div>
          <p class="text-[11px] text-[#787774]">${hub.description}</p>
          <div class="text-[10px] font-mono text-[#787774] pt-0.5">
            Bays: <strong class="text-[#111111]">${hub.bayCount}</strong> • Transfers: <strong class="text-[#956400]">${hub.activeTransfers}</strong>
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

    busFleet.forEach((bus, index) => {
      if (!bus.assignedRoute || bus.status !== 'IN_SERVICE') return;
      const route = routes.find(r => r.code === bus.assignedRoute);
      if (!route || !route.pathCoordinates || route.pathCoordinates.length < 2) return;

      const totalPoints = route.pathCoordinates.length;
      const progressFactor = ((operationalTime * 0.1) + (index * 2.5)) % (totalPoints - 1);
      const baseIndex = Math.floor(progressFactor);
      const frac = progressFactor - baseIndex;

      const p1 = route.pathCoordinates[baseIndex];
      const p2 = route.pathCoordinates[Math.min(totalPoints - 1, baseIndex + 1)];

      const currentLng = p1[0] + (p2[0] - p1[0]) * frac;
      const currentLat = p1[1] + (p2[1] - p1[1]) * frac;

      const activeDuty = dutyAssignments.find(d => d.busId === bus.id);

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-4.5 h-4.5 rounded-[3px] ${activeDuty?.dutyType === 'UNLINKED' ? 'bg-[#956400]' : 'bg-[#111111]'} text-white flex items-center justify-center font-mono text-[8px] font-bold shadow-xs">
              ${bus.busNumber.replace('EV-', '')}
            </div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([currentLat, currentLng], { icon: busIcon });
      
      marker.bindTooltip(`
        <div class="p-1 font-mono text-xs">
          <div class="font-bold text-[#111111]">${bus.busNumber}</div>
          <div class="text-[#787774]">Route ${route.code} • Batt: ${bus.batteryPct}%</div>
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

    if (drawnCoordinates.length >= 2) {
      const propBuffer = createCorridorBuffer(drawnCoordinates, 50);
      if (propBuffer) {
        const propBufferLayer = L.geoJSON(propBuffer, {
          style: {
            color: overlapReport?.overlapPercentage > 40 ? '#9F2F2D' : '#1F6C9F',
            weight: 1,
            opacity: 0.7,
            fillColor: overlapReport?.overlapPercentage > 40 ? '#FDEBEC' : '#E1F3FE',
            fillOpacity: 0.4,
            dashArray: '4, 4'
          }
        });
        layersRef.current.drawingLayer.addLayer(propBufferLayer);
      }
    }

    const propPolyline = L.polyline(latLngs, {
      color: overlapReport?.overlapPercentage > 40 ? '#9F2F2D' : '#1F6C9F',
      weight: 3.5,
      dashArray: '6, 6',
      opacity: 0.95
    });
    layersRef.current.drawingLayer.addLayer(propPolyline);

    drawnCoordinates.forEach((coord, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === drawnCoordinates.length - 1;

      const wpMarker = L.circleMarker([coord[1], coord[0]], {
        radius: isStart || isEnd ? 5 : 3.5,
        fillColor: isStart ? '#346538' : isEnd ? '#9F2F2D' : '#111111',
        fillOpacity: 1,
        color: '#FFFFFF',
        weight: 1.5
      });
      layersRef.current.drawingLayer.addLayer(wpMarker);
    });

    if (overlapReport?.intersections) {
      overlapReport.intersections.forEach(cross => {
        const [xLng, xLat] = cross.coordinates;
        const xMarker = L.circleMarker([xLat, xLng], {
          radius: 6,
          fillColor: '#9F2F2D',
          fillOpacity: 0.9,
          color: '#FFFFFF',
          weight: 1.5
        });
        layersRef.current.overlapLayer.addLayer(xMarker);
      });
    }

  }, [drawnCoordinates, overlapReport]);

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
      name: `Express Link ${drawnCoordinates.length}W`,
      color: '#1F6C9F',
      lengthKm,
      frequencyMins: 15,
      operatingHours: "06:00 - 22:00",
      bufferMeters: 50,
      stops: drawnCoordinates.map((c, i) => ({ name: `Node ${i + 1}`, coordinates: c })),
      pathCoordinates: drawnCoordinates
    };

    onCommitNewRoute(newRoute);
    clearDrawing();
    setIsDrawingMode(false);
  };

  return (
    <div className="relative w-full h-full min-h-[480px] flex-1 flex flex-col overflow-hidden bg-[#FBFBFA]">
      
      {/* Map Header Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Layer Toggles & Mode */}
        <div className="flex items-center space-x-1.5 bg-[#FFFFFF] border border-[#EAEAEA] p-1 rounded-[6px] shadow-xs pointer-events-auto">
          
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[4px] text-xs font-semibold transition-all ${
              isDrawingMode 
                ? 'bg-[#111111] text-white active:scale-95'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-[#EAEAEA]'
            }`}
          >
            <Pencil className="w-3 h-3" />
            <span>{isDrawingMode ? 'Drawing (Click Map)' : 'Draw Route'}</span>
          </button>

          <div className="h-3 w-px bg-[#EAEAEA] mx-0.5"></div>

          <button
            onClick={() => setShowBuffers(!showBuffers)}
            className={`px-2 py-0.5 rounded-[3px] text-[11px] font-mono transition ${
              showBuffers ? 'bg-[#E1F3FE] text-[#1F6C9F] font-semibold' : 'text-[#787774] hover:text-[#111111]'
            }`}
          >
            50m Buffer
          </button>

          <button
            onClick={() => setShowHubs(!showHubs)}
            className={`px-2 py-0.5 rounded-[3px] text-[11px] font-mono transition ${
              showHubs ? 'bg-[#F3EBF9] text-[#6E3294] font-semibold' : 'text-[#787774] hover:text-[#111111]'
            }`}
          >
            Hubs (15m)
          </button>

          <button
            onClick={() => setShowBuses(!showBuses)}
            className={`px-2 py-0.5 rounded-[3px] text-[11px] font-mono transition ${
              showBuses ? 'bg-[#EDF3EC] text-[#346538] font-semibold' : 'text-[#787774] hover:text-[#111111]'
            }`}
          >
            Live Buses
          </button>
        </div>

        {/* Right: Presets */}
        <div className="flex items-center space-x-1.5 bg-[#FFFFFF] border border-[#EAEAEA] p-1 rounded-[6px] shadow-xs pointer-events-auto text-xs font-mono">
          <span className="text-[#787774] text-[10px] uppercase font-semibold pl-1 hidden lg:inline">Scenarios:</span>
          
          <button
            onClick={() => loadPresetRoute(PROPOSED_ROUTE_TEMPLATES[0])}
            className="px-2 py-0.5 rounded-[3px] bg-[#FDEBEC] text-[#9F2F2D] text-[11px] font-semibold hover:bg-[#F9DCDD] transition"
          >
            Scenario A (58% Overlap)
          </button>

          <button
            onClick={() => loadPresetRoute(PROPOSED_ROUTE_TEMPLATES[1])}
            className="px-2 py-0.5 rounded-[3px] bg-[#E1F3FE] text-[#1F6C9F] text-[11px] font-semibold hover:bg-[#D5EBFB] transition"
          >
            Scenario B (8% Clean)
          </button>
        </div>

      </div>

      {/* Main Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] flex-1 z-10" />

      {/* Drawing Toolbar Overlay & Overlap Conflict HUD */}
      {isDrawingMode && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-[#FFFFFF] border border-[#EAEAEA] rounded-[8px] p-3.5 shadow-md space-y-2.5">
          
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAEAEA] pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-[4px] bg-[#111111] flex items-center justify-center text-white">
                <Pencil className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111111] flex items-center space-x-2">
                  <span>Interactive Route Placer</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F7F6F3] text-[#787774] border border-[#EAEAEA]">
                    {drawnCoordinates.length} Waypoints
                  </span>
                </h4>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={clearDrawing}
                disabled={drawnCoordinates.length === 0}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-[4px] bg-[#F7F6F3] hover:bg-[#EAEAEA] text-[#787774] text-xs font-mono transition disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>

              <button
                onClick={commitProposedRoute}
                disabled={drawnCoordinates.length < 2}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-[4px] bg-[#111111] hover:bg-[#333333] text-white text-xs font-mono font-semibold transition active:scale-95 disabled:opacity-40"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Commit to Network</span>
              </button>
            </div>
          </div>

          {/* Overlap HUD */}
          {overlapReport && drawnCoordinates.length >= 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-0.5">
              
              <div className={`md:col-span-4 p-2.5 rounded-[6px] border flex flex-col justify-between ${
                overlapReport.overlapPercentage > 40
                  ? 'bg-[#FDEBEC] border-[#F7D2D4] text-[#9F2F2D]'
                  : overlapReport.overlapPercentage >= 15
                  ? 'bg-[#FBF3DB] border-[#F3E4BA] text-[#956400]'
                  : 'bg-[#EDF3EC] border-[#D5E5D4] text-[#346538]'
              }`}>
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold">
                    <span>Overlap Metric</span>
                    <span>{overlapReport.congestionLevel.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-baseline space-x-1.5 mt-0.5 font-mono">
                    <span className="text-xl font-bold">{overlapReport.overlapPercentage}%</span>
                    <span className="text-[10px]">({overlapReport.totalOverlapKm} km / {overlapReport.proposedLengthKm} km)</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono mt-1 leading-snug">
                  {overlapReport.summary}
                </div>
              </div>

              <div className="md:col-span-8 bg-[#FBFBFA] rounded-[6px] border border-[#EAEAEA] p-2.5 space-y-1.5 max-h-28 overflow-y-auto font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-[#787774] border-b border-[#EAEAEA] pb-0.5">
                  <span>Detected Shared Segments (50m Buffer)</span>
                  <span>Crossings: <strong className="text-[#111111]">{overlapReport.intersections.length}</strong></span>
                </div>

                {overlapReport.sharedCorridors.length > 0 ? (
                  <div className="space-y-1">
                    {overlapReport.sharedCorridors.map((corridor, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1 py-0.2 rounded bg-[#E1F3FE] text-[#1F6C9F] font-bold">Route {corridor.existingRouteCode}</span>
                          <span className="text-[#111111] truncate max-w-[160px]">{corridor.existingRouteName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#787774]">
                          <span>{corridor.overlapLengthKm} km</span>
                          <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                            corridor.risk === 'HIGH' ? 'bg-[#FDEBEC] text-[#9F2F2D]' : 'bg-[#FBF3DB] text-[#956400]'
                          }`}>
                            {corridor.risk}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#346538] py-1 flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Independent corridor. Zero high-risk collision.</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-[11px] font-mono text-[#787774] text-center py-1">
              Click at least 2 points on the map to begin real-time spatial conflict & buffer analysis.
            </div>
          )}

        </div>
      )}

      {/* Map Legend */}
      {!isDrawingMode && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-[#FFFFFF] border border-[#EAEAEA] rounded-[6px] p-2 shadow-xs text-[10px] font-mono space-y-1 hidden sm:block">
          <div className="font-bold text-[#111111] border-b border-[#EAEAEA] pb-0.5">Network GIS</div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 bg-[#1F6C9F] rounded-[1px]"></span>
            <span className="text-[#787774]">Route 101 Airport</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-1 bg-[#346538] rounded-[1px]"></span>
            <span className="text-[#787774]">Route 204 Spine</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-[#6E3294]"></span>
            <span className="text-[#787774]">Interchange Hub (15m)</span>
          </div>
        </div>
      )}

    </div>
  );
}
