import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Pencil, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  Bus,
  Clock,
  UserCheck,
  Zap,
  X,
  Compass,
  Activity,
  Layers
} from 'lucide-react';
import { 
  calculateRouteLength, 
  createCorridorBuffer, 
  detectRouteOverlap 
} from '../utils/gisCalculations';
import { PROPOSED_ROUTE_TEMPLATES, CITIES_DATA } from '../data/transitData';
import { computeBusPositions } from '../services/busLocationService';

export default function RouteMap({
  routes = [],
  interchangeHubs = [],
  busFleet = [],
  dutyAssignments = [],
  operationalTime = 480,
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
  setOverlapReport,
  onSelectBus,
  selectedCity = 'delhi'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    routesLayer: null,
    buffersLayer: null,
    hubsLayer: null,
    busesLayer: null,
    drawingLayer: null,
    overlapLayer: null,
    trailLayer: null
  });

  const [showBuffers, setShowBuffers] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [showHubs, setShowHubs] = useState(true);

  const [selectedBusDetail, setSelectedBusDetail] = useState(null);
  const [followingBusId, setFollowingBusId] = useState(null);
  const [busTrailCoords, setBusTrailCoords] = useState([]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const cityCoords = CITIES_DATA[selectedCity]?.coordinates || [28.6139, 77.2090];
      const map = L.map(mapContainerRef.current, {
        center: cityCoords,
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'minimal-osm-tiles'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      layersRef.current.buffersLayer = L.layerGroup().addTo(map);
      layersRef.current.routesLayer = L.layerGroup().addTo(map);
      layersRef.current.overlapLayer = L.layerGroup().addTo(map);
      layersRef.current.trailLayer = L.layerGroup().addTo(map);
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

  // Smooth flyTo Map Camera Animation on City Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const cityCoords = CITIES_DATA[selectedCity]?.coordinates || [28.6139, 77.2090];
    map.flyTo(cityCoords, 12, {
      duration: 1.5,
      easeLinearity: 0.25
    });

    // Reset selected bus detail on city switch
    setSelectedBusDetail(null);
    setFollowingBusId(null);
    setBusTrailCoords([]);
  }, [selectedCity]);

  // MAP AUTO-FIT: Auto-fit map bounding box when selecting a route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRouteId) return;

    const targetRoute = routes.find(r => r.id === selectedRouteId || r.code === selectedRouteId);
    if (targetRoute && targetRoute.pathCoordinates && targetRoute.pathCoordinates.length >= 2) {
      const bounds = L.latLngBounds(targetRoute.pathCoordinates.map(c => [c[1], c[0]]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [selectedRouteId, routes]);

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
              color: route.color || '#2563eb',
              weight: 1,
              opacity: isSelected ? 0.6 : 0.25,
              fillColor: route.color || '#2563eb',
              fillOpacity: isSelected ? 0.15 : isHovered ? 0.12 : 0.05,
              dashArray: '3, 3'
            }
          });
          layersRef.current.buffersLayer.addLayer(bufferLayer);
        }
      }

      // Polyline
      const polyline = L.polyline(latLngs, {
        color: route.color || '#2563eb',
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
            radius: isSelected ? 5 : 4,
            fillColor: route.color || '#2563eb',
            fillOpacity: 1,
            color: '#FFFFFF',
            weight: 2
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

  // Render Moving Bus Markers with Swiggy/Zomato-style movement, FOLLOW BUS, and TRAIL
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.busesLayer) return;

    layersRef.current.busesLayer.clearLayers();
    if (layersRef.current.trailLayer) layersRef.current.trailLayer.clearLayers();

    if (!showBuses) return;

    // Use isolated bus location simulation service
    const liveBuses = computeBusPositions(busFleet, routes, dutyAssignments, operationalTime);

    liveBuses.forEach((bus) => {
      if (!bus.currentLocation) return;
      const [lat, lng] = bus.currentLocation;

      // FOLLOW BUS MODE: Automatically lock map camera to followed bus position
      if (followingBusId === bus.id && map) {
        map.panTo([lat, lng], { animate: true, duration: 0.8 });

        // Add subtle bus trail polyline
        const newCoords = [...busTrailCoords, [lat, lng]].slice(-12);
        if (layersRef.current.trailLayer && newCoords.length >= 2) {
          const trailPolyline = L.polyline(newCoords, {
            color: '#3b82f6',
            weight: 3,
            dashArray: '4, 4',
            opacity: 0.6
          });
          layersRef.current.trailLayer.addLayer(trailPolyline);
        }
      }

      // Determine Marker Badge State Icon & Color
      let stateBadge = '🚌';
      let borderStyle = 'border-primary bg-primary text-primary-foreground';

      if (bus.liveStatus === 'DELAYED') {
        stateBadge = '🚌 ⚠';
        borderStyle = 'border-amber-500 bg-amber-500 text-white';
      } else if (bus.liveStatus === 'CANCELLED') {
        stateBadge = '✕';
        borderStyle = 'border-rose-600 bg-rose-600 text-white';
      } else if (bus.liveStatus === 'OVERFLOW') {
        stateBadge = '🚌 + ⚠';
        borderStyle = 'border-rose-500 bg-rose-500 text-white animate-pulse';
      } else if (bus.liveStatus === 'DRIVER_ISSUE') {
        stateBadge = '🚌 ⚠';
        borderStyle = 'border-amber-600 bg-amber-600 text-white';
      }

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="px-2 py-0.5 rounded-full border ${borderStyle} shadow-md flex items-center space-x-1 font-mono text-[10px] font-bold tracking-tight">
              <span>${stateBadge}</span>
              <span>${bus.busNumber.replace('DL ', '').replace('MH ', '').replace('KA ', '').replace('UP ', '').replace('TN ', '')}</span>
            </div>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12]
      });

      const marker = L.marker([lat, lng], { icon: busIcon });

      // Click handler opens compact bus inspection panel
      marker.on('click', () => {
        setSelectedBusDetail(bus);
        if (onSelectBus) onSelectBus(bus);
      });

      marker.bindTooltip(`
        <div class="p-1 font-mono text-xs">
          <div class="font-bold text-foreground">${bus.busNumber}</div>
          <div class="text-muted-foreground">Route ${bus.routeCode} • Next: ${bus.nextStop} (${bus.etaMins}m)</div>
          <div class="text-primary font-semibold">Occupancy: ${bus.occupancyRatio}</div>
        </div>
      `, { sticky: true });

      layersRef.current.busesLayer.addLayer(marker);
    });
  }, [busFleet, routes, dutyAssignments, operationalTime, showBuses, followingBusId, busTrailCoords, onSelectBus]);

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
            color: overlapReport?.overlapPercentage > 40 ? '#ef4444' : '#2563eb',
            weight: 1,
            opacity: 0.7,
            fillColor: overlapReport?.overlapPercentage > 40 ? '#fef2f2' : '#eff6ff',
            fillOpacity: 0.4,
            dashArray: '4, 4'
          }
        });
        layersRef.current.drawingLayer.addLayer(propBufferLayer);
      }
    }

    const propPolyline = L.polyline(latLngs, {
      color: overlapReport?.overlapPercentage > 40 ? '#ef4444' : '#2563eb',
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
        fillColor: isStart ? '#10b981' : isEnd ? '#ef4444' : '#2563eb',
        fillOpacity: 1,
        color: '#FFFFFF',
        weight: 1.5
      });
      layersRef.current.drawingLayer.addLayer(wpMarker);
    });

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
      name: `${selectedCity === 'chennai' ? 'Chennai Express' : 'Delhi Express'} Link ${drawnCoordinates.length}W`,
      color: '#2563eb',
      lengthKm,
      frequencyMins: 15,
      operatingHours: "06:00 - 22:00 IST",
      bufferMeters: 50,
      stops: drawnCoordinates.map((c, i) => ({ name: `Node ${i + 1}`, coordinates: c })),
      pathCoordinates: drawnCoordinates
    };

    onCommitNewRoute(newRoute);
    clearDrawing();
    setIsDrawingMode(false);
  };

  return (
    <div className="relative w-full h-full min-h-[480px] flex-1 flex flex-col overflow-hidden bg-background">
      
      {/* Map Header Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Layer Toggles & Mode */}
        <div className="flex items-center space-x-1.5 bg-card border border-border p-1 rounded-md shadow-card pointer-events-auto">
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isDrawingMode 
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/50 text-foreground hover:bg-muted'
            }`}
          >
            <Pencil className="w-3 h-3" />
            <span>{isDrawingMode ? 'Drawing (Click Map)' : '+ Plan Route'}</span>
          </button>

          <div className="h-3 w-px bg-border mx-0.5" />

          <button
            onClick={() => setShowBuffers(!showBuffers)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
              showBuffers ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            50m Buffer
          </button>

          <button
            onClick={() => setShowHubs(!showHubs)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
              showHubs ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Terminal Hubs
          </button>

          <button
            onClick={() => setShowBuses(!showBuses)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
              showBuses ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Live Buses
          </button>
        </div>

        {/* Right: Network Health Pill */}
        <div className="flex items-center space-x-2 bg-card border border-border px-3 py-1 rounded-md shadow-card pointer-events-auto text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-muted-foreground">NETWORK HEALTH:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">● 96% Operational</span>
        </div>

      </div>

      {/* Main Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] flex-1 z-10" />

      {/* COMPACT BUS INSPECTION PANEL WITH FOLLOW BUS TOGGLE */}
      {selectedBusDetail && (
        <div className="absolute top-16 left-3 z-[1000] w-72 bg-card border border-border rounded-lg p-3.5 shadow-modal space-y-2.5 font-sans animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <div className="flex items-center space-x-2">
              <Bus className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm font-bold text-foreground">
                {selectedBusDetail.busNumber}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedBusDetail(null);
                setFollowingBusId(null);
              }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Route:</span>
              <span className="font-bold text-primary">Route {selectedBusDetail.routeCode || '102'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Driver:</span>
              <span className="font-bold text-foreground">{selectedCity === 'chennai' ? 'Arun Kumar' : 'Rajesh Kumar'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next Stop:</span>
              <span className="font-bold text-foreground">{selectedBusDetail.nextStop || 'Adyar O.T.'} • {selectedBusDetail.etaMins || 4} min</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Occupancy:</span>
              <span className="font-bold text-foreground">{selectedBusDetail.occupancyRatio || '38 / 50'}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                selectedBusDetail.liveStatus === 'DELAYED'
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                  : selectedBusDetail.liveStatus === 'OVERFLOW'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              }`}>
                ● {selectedBusDetail.liveStatus || 'ON TIME'}
              </span>
            </div>
          </div>

          {/* Follow Bus Mode Button */}
          <div className="pt-1 flex items-center justify-between border-t border-border/50">
            <button
              onClick={() => {
                if (followingBusId === selectedBusDetail.id) {
                  setFollowingBusId(null);
                } else {
                  setFollowingBusId(selectedBusDetail.id);
                  setBusTrailCoords(selectedBusDetail.currentLocation ? [selectedBusDetail.currentLocation] : []);
                }
              }}
              className={`w-full py-1.5 rounded font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                followingBusId === selectedBusDetail.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-foreground hover:bg-accent'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${followingBusId === selectedBusDetail.id ? 'animate-spin' : ''}`} />
              <span>{followingBusId === selectedBusDetail.id ? '● FOLLOWING BUS' : 'FOLLOW BUS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPACT MAP LEGEND */}
      {!isDrawingMode && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-card/95 backdrop-blur-xs border border-border rounded-md p-2 shadow-card text-[10px] font-mono space-y-1 hidden sm:block">
          <div className="font-bold text-foreground border-b border-border pb-0.5 uppercase tracking-wider">Map Legend</div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
            <span className="text-muted-foreground">🚌 Live Bus</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-muted-foreground">⚠ Delayed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span className="text-muted-foreground">✕ Cancelled</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full border border-primary bg-background inline-block" />
            <span className="text-muted-foreground">● Bus Stop</span>
          </div>
        </div>
      )}

    </div>
  );
}
