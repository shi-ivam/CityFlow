import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, MapPin, Zap, Clock, Wrench } from 'lucide-react';

export default function VehicleMapView({
  busFleet = [],
  routes = [],
  selectedVehicleId = null,
  onSelectVehicle
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Delhi Center
      const map = L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Render Routes
    routes.forEach(route => {
      if (route.pathCoordinates && route.pathCoordinates.length > 1) {
        const latLngs = route.pathCoordinates.map(c => [c[1], c[0]]);
        L.polyline(latLngs, {
          color: route.color || '#3b82f6',
          weight: 4,
          opacity: 0.6
        }).addTo(map);
      }
    });

    // Render Vehicle Pins
    busFleet.forEach(bus => {
      const coords = bus.currentCoordinates || [77.2183, 28.6328];
      const latLng = [coords[1], coords[0]];

      const isSelected = selectedVehicleId === bus.id;
      const isInService = bus.status === 'IN_SERVICE';

      const customIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="
            background-color: ${isInService ? '#10b981' : '#f59e0b'};
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid ${isSelected ? '#000' : '#fff'};
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span>🚍</span>
            <span>${bus.busNumber}</span>
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });

      const marker = L.marker(latLng, { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          if (onSelectVehicle) onSelectVehicle(bus);
        });

      markersRef.current[bus.id] = marker;
    });

    return () => {
      // Cleanup on unmount if needed
    };
  }, [busFleet, routes, selectedVehicleId]);

  return (
    <div className="w-full h-full min-h-[450px] relative rounded-lg border border-border overflow-hidden shadow-xs bg-muted/20">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
      
      {/* Map Overlay Badge */}
      <div className="absolute top-3 right-3 z-[1000] bg-card/90 backdrop-blur-xs border border-border p-2.5 rounded shadow-lg font-mono text-xs space-y-1">
        <div className="text-[10px] text-muted-foreground uppercase font-bold">LIVE FLEET CORRIDOR MAP</div>
        <div className="text-foreground font-bold">{busFleet.length} Vehicles Tracked</div>
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">● GPS Sync Active</div>
      </div>
    </div>
  );
}
