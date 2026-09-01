import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, CustomLayerInterface } from 'maplibre-gl';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ActiveBus, TransitRoute, MapProviderId, MAP_PROVIDERS } from '../../types/transit';
import { CHENNAI_CENTER, CHENNAI_HUBS } from '../../data/chennaiRoutes';
import { Compass, ShieldAlert, Navigation2, Zap, User, Clock, Layers, ZoomOut } from 'lucide-react';

interface ChennaiTransitMapProps {
  routes: TransitRoute[];
  activeBuses: ActiveBus[];
  selectedBusId: string | null;
  onSelectBus: (busId: string | null) => void;
  selectedRouteId: string | null;
  theme: 'dark' | 'light';
  showBuffers: boolean;
  onToggleBuffers: () => void;
  mapProvider: MapProviderId;
  onSetMapProvider: (provider: MapProviderId) => void;
  maptilerKey?: string;
  cinematicBusId?: string | null;
  cinematicStage?: 'idle' | 'intercept' | 'rear_zoom' | 'cockpit_warp' | 'complete';
}

function getProviderMapStyle(provider: MapProviderId, theme: 'dark' | 'light', maptilerKey = '') {
  if (provider === 'satellite') {
    return {
      version: 8 as const,
      sources: {
        'satellite-base': {
          type: 'raster' as const,
          tiles: [
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        },
        'satellite-roads': {
          type: 'raster' as const,
          tiles: [
            'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'satellite-base-layer',
          type: 'raster' as const,
          source: 'satellite-base',
          minzoom: 0,
          maxzoom: 20,
        },
        {
          id: 'satellite-roads-layer',
          type: 'raster' as const,
          source: 'satellite-roads',
          minzoom: 0,
          maxzoom: 20,
          paint: {
            'raster-opacity': 0.85,
          },
        },
      ],
    };
  }

  if (provider === 'osm') {
    return {
      version: 8 as const,
      sources: {
        'osm-base': {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-base-layer',
          type: 'raster' as const,
          source: 'osm-base',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }

  if (provider === 'stadia') {
    const tileUrl =
      theme === 'dark'
        ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
        : 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
    return {
      version: 8 as const,
      sources: {
        'stadia-base': {
          type: 'raster' as const,
          tiles: [tileUrl],
          tileSize: 256,
          attribution: '© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'stadia-base-layer',
          type: 'raster' as const,
          source: 'stadia-base',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };
  }

  if (provider === 'maptiler') {
    const key = maptilerKey.trim() || 'get_your_own_OpIi9ZULNHzrESv6T2vL';
    const tileStyle =
      theme === 'dark'
        ? `https://api.maptiler.com/maps/dataviz-dark/256/{z}/{x}/{y}.png?key=${key}`
        : `https://api.maptiler.com/maps/dataviz-light/256/{z}/{x}/{y}.png?key=${key}`;
    return {
      version: 8 as const,
      sources: {
        'maptiler-base': {
          type: 'raster' as const,
          tiles: [tileStyle],
          tileSize: 256,
          attribution: '© MapTiler, © OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'maptiler-base-layer',
          type: 'raster' as const,
          source: 'maptiler-base',
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };
  }

  // Default: CARTO Vector GL (Dark Matter / Positron) - Sharp vector road network
  return theme === 'dark'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
}

export const ChennaiTransitMap: React.FC<ChennaiTransitMapProps> = ({
  routes,
  activeBuses,
  selectedBusId,
  onSelectBus,
  selectedRouteId,
  theme,
  showBuffers,
  onToggleBuffers,
  mapProvider,
  onSetMapProvider,
  maptilerKey = '',
  cinematicBusId = null,
  cinematicStage = 'idle',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busesRef = useRef<ActiveBus[]>(activeBuses);
  const selectedBusIdRef = useRef<string | null>(selectedBusId);
  const selectedRouteIdRef = useRef<string | null>(selectedRouteId);
  const is3DRef = useRef<boolean>(true);
  const cinematicBusIdRef = useRef<string | null>(cinematicBusId);
  const cinematicStageRef = useRef<'idle' | 'intercept' | 'rear_zoom' | 'cockpit_warp' | 'complete'>(cinematicStage);

  const [is3D, setIs3D] = useState<boolean>(true);
  const [hoveredCoord, setHoveredCoord] = useState<[number, number]>(CHENNAI_CENTER);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [stlModelLoaded, setStlModelLoaded] = useState<boolean>(false);

  useEffect(() => {
    busesRef.current = activeBuses;
  }, [activeBuses]);

  useEffect(() => {
    selectedBusIdRef.current = selectedBusId;
  }, [selectedBusId]);

  useEffect(() => {
    selectedRouteIdRef.current = selectedRouteId;
  }, [selectedRouteId]);

  useEffect(() => {
    cinematicBusIdRef.current = cinematicBusId;
  }, [cinematicBusId]);

  useEffect(() => {
    cinematicStageRef.current = cinematicStage;
  }, [cinematicStage]);

  // Update Dynamic Buses GeoJSON for Map Markers & Hover
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const source = map.getSource('active-buses-marker') as maplibregl.GeoJSONSource;
    if (source) {
      const busFeatures = activeBuses.map((bus) => ({
        type: 'Feature' as const,
        properties: {
          id: bus.id,
          routeCode: bus.routeCode,
          speed: bus.speedKmH,
          status: bus.status,
          nextStop: bus.nextStopName,
          driver: bus.driverName,
          occupancy: bus.occupancyPercent,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: bus.currentCoord,
        },
      }));
      source.setData({
        type: 'FeatureCollection',
        features: busFeatures,
      });
    }
  }, [activeBuses, mapLoaded]);

  const isInitialFlyingRef = useRef<boolean>(false);

  // Cinematic Flight Sequence for Driver Transition
  useEffect(() => {
    if (!mapRef.current || !cinematicBusId || cinematicStage === 'idle') return;
    const bus = busesRef.current.find((b) => b.id === cinematicBusId);
    if (!bus) return;

    if (cinematicStage === 'intercept') {
      isInitialFlyingRef.current = true;
      mapRef.current.flyTo({
        center: bus.currentCoord,
        zoom: 15.0,
        pitch: 52,
        bearing: bus.heading,
        speed: 1.4,
        curve: 1.1,
        essential: true,
      });

      const timer = setTimeout(() => {
        isInitialFlyingRef.current = false;
      }, 750);
      return () => clearTimeout(timer);
    } else if (cinematicStage === 'rear_zoom') {
      isInitialFlyingRef.current = true;
      mapRef.current.easeTo({
        center: bus.currentCoord,
        zoom: 15.8,
        pitch: 58,
        bearing: bus.heading,
        duration: 950,
        essential: true,
      });

      const timer = setTimeout(() => {
        isInitialFlyingRef.current = false;
      }, 950);
      return () => clearTimeout(timer);
    } else if (cinematicStage === 'cockpit_warp') {
      mapRef.current.easeTo({
        center: bus.currentCoord,
        zoom: 16.2,
        pitch: 60,
        bearing: bus.heading,
        duration: 550,
        essential: true,
      });
    }
  }, [cinematicBusId, cinematicStage]);

  // Standard initial approach flight on bus selection (when not in cinematic transition)
  useEffect(() => {
    if (!mapRef.current || !selectedBusId || cinematicBusId) {
      if (!cinematicBusId) isInitialFlyingRef.current = false;
      return;
    }
    const bus = busesRef.current.find((b) => b.id === selectedBusId);
    if (!bus) return;

    isInitialFlyingRef.current = true;
    mapRef.current.flyTo({
      center: bus.currentCoord,
      zoom: 15.0,
      pitch: is3D ? 55 : 0,
      bearing: is3D ? bus.heading - 15 : 0,
      speed: 1.1,
      curve: 1.4,
      essential: true,
    });

    const timer = setTimeout(() => {
      isInitialFlyingRef.current = false;
    }, 1100);

    return () => clearTimeout(timer);
  }, [selectedBusId, cinematicBusId]);

  // Buttery-smooth 60fps continuous camera tracking loop
  useEffect(() => {
    const targetBusId = cinematicBusId || selectedBusId;
    if (!targetBusId) return;
    let animId: number;

    const followLoop = () => {
      const map = mapRef.current;
      const activeCinematic = cinematicBusIdRef.current;
      const activeSelected = selectedBusIdRef.current;
      const activeTargetId = activeCinematic || activeSelected;

      if (map && activeTargetId && !isInitialFlyingRef.current) {
        const bus = busesRef.current.find((b) => b.id === activeTargetId);
        if (bus) {
          const currentCenter = map.getCenter();
          const targetLng = bus.currentCoord[0];
          const targetLat = bus.currentCoord[1];

          const diffLng = targetLng - currentCenter.lng;
          const diffLat = targetLat - currentCenter.lat;

          // Follow smoothly if in range
          if (Math.abs(diffLng) < 0.1 && Math.abs(diffLat) < 0.1) {
            const lerpFactor = activeCinematic ? 0.18 : 0.08;
            const nextLng = currentCenter.lng + diffLng * lerpFactor;
            const nextLat = currentCenter.lat + diffLat * lerpFactor;

            let nextBearing = map.getBearing();
            if (activeCinematic) {
              const targetBearing = bus.heading;
              const angleDiff = ((targetBearing - nextBearing + 540) % 360) - 180;
              nextBearing = nextBearing + angleDiff * 0.12; // Tight chase cam rotation
            } else if (is3DRef.current) {
              const targetBearing = bus.heading - 15;
              const angleDiff = ((targetBearing - nextBearing + 540) % 360) - 180;
              nextBearing = nextBearing + angleDiff * 0.03; // Smooth stabilized rotation
            }

            map.jumpTo({
              center: [nextLng, nextLat],
              bearing: (is3DRef.current || activeCinematic) ? nextBearing : 0,
            });
          }
        }
      }
      animId = requestAnimationFrame(followLoop);
    };

    animId = requestAnimationFrame(followLoop);
    return () => cancelAnimationFrame(animId);
  }, [selectedBusId, cinematicBusId]);

  // Setup layers helper
  const setupMapLayers = (map: MapLibreMap) => {
    // Add Routes GeoJSON source with strong, distinct transit colors (Section 2, 3)
    if (!map.getSource('transit-routes')) {
      const getRouteColor = (code: string) => {
        switch (code) {
          case '570': return '#16A34A'; // Active Green
          case '21G': return '#2563EB'; // Royal Blue
          case '19B': return '#5B3CC4'; // Primary Rich Violet
          case '23C': return '#0891B2'; // Deep Cyan/Teal
          default: return '#5B3CC4';
        }
      };

      const routeFeatures = routes.map((r) => ({
        type: 'Feature' as const,
        properties: {
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category,
          color: getRouteColor(r.code),
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: r.coordinates,
        },
      }));

      map.addSource('transit-routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routeFeatures,
        },
      });
    }

    // Buffer / Corridor Halo Layer
    if (!map.getLayer('route-buffers')) {
      map.addLayer({
        id: 'route-buffers',
        type: 'line',
        source: 'transit-routes',
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#7C69A5',
          'line-width': 22,
          'line-opacity': theme === 'dark' ? 0.12 : 0.08,
          'line-dasharray': [2, 2],
        },
        layout: {
          visibility: showBuffers ? 'visible' : 'none',
        },
      });
    }

    // Route Casing Layer: In dark mode keep as before only (#ffffff 0.4 opacity); in light mode use crisp white halo
    if (!map.getLayer('route-casing')) {
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'transit-routes',
        paint: {
          'line-color': '#ffffff',
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedRouteId || ''],
            theme === 'dark' ? 7 : 8.5,
            theme === 'dark' ? 6 : 7.2
          ],
          'line-opacity': theme === 'dark' ? 0.4 : 0.95,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        }
      });
    }

    // Route Main Line: In dark mode keep as before only (#ffffff); in light mode use Lavender (#7C69A5 / #5B3CC4)
    if (!map.getLayer('route-main')) {
      map.addLayer({
        id: 'route-main',
        type: 'line',
        source: 'transit-routes',
        paint: {
          'line-color': theme === 'dark'
            ? '#ffffff' // Dark mode: as before only!
            : [
                'case',
                ['==', ['get', 'id'], selectedRouteId || ''],
                '#5B3CC4', // Selected deep lavender
                '#7C69A5'  // Light mode: Lavender
              ],
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedRouteId || ''],
            theme === 'dark' ? 5 : 5.8,
            theme === 'dark' ? 3.5 : 4.8
          ],
          'line-opacity': [
            'case',
            ['==', ['get', 'id'], selectedRouteId || ''],
            1.0,
            selectedRouteId ? 0.28 : 0.95
          ]
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        }
      });
    }

    // Add Stops GeoJSON
    if (!map.getSource('transit-stops')) {
      const allStops = routes.flatMap((r) =>
        r.stops.map((s) => ({
          type: 'Feature' as const,
          properties: {
            id: s.id,
            name: s.name,
            code: s.code,
            isHub: s.isHub || false,
            routeCode: r.code,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: s.coordinates,
          },
        }))
      );

      map.addSource('transit-stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: allStops,
        },
      });
    }

    // Stop Outer Ring
    if (!map.getLayer('stops-outer')) {
      map.addLayer({
        id: 'stops-outer',
        type: 'circle',
        source: 'transit-stops',
        paint: {
          'circle-radius': ['case', ['get', 'isHub'], 7, 4.5],
          'circle-color': theme === 'dark' ? '#000000' : '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': theme === 'dark' ? '#ffffff' : '#000000',
        },
      });
    }

    // Stop Inner Dot
    if (!map.getLayer('stops-inner')) {
      map.addLayer({
        id: 'stops-inner',
        type: 'circle',
        source: 'transit-stops',
        paint: {
          'circle-radius': ['case', ['get', 'isHub'], 3.5, 2],
          'circle-color': theme === 'dark' ? '#ffffff' : '#000000',
        },
      });
    }

    // Active Buses Marker Source
    if (!map.getSource('active-buses-marker')) {
      const busFeatures = activeBuses.map((bus) => ({
        type: 'Feature' as const,
        properties: {
          id: bus.id,
          routeCode: bus.routeCode,
          speed: bus.speedKmH,
          status: bus.status,
          nextStop: bus.nextStopName,
          driver: bus.driverName,
          occupancy: bus.occupancyPercent,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: bus.currentCoord,
        },
      }));

      map.addSource('active-buses-marker', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: busFeatures,
        },
      });
    }

    // Active Bus Click Target (Fully transparent for clean 3D mesh rendering)
    if (!map.getLayer('bus-markers-halo')) {
      map.addLayer({
        id: 'bus-markers-halo',
        type: 'circle',
        source: 'active-buses-marker',
        paint: {
          'circle-radius': 16,
          'circle-color': '#000000',
          'circle-opacity': 0,
        },
      });
    }

    // Setup Three.js Custom WebGL Layer for 3D STL Bus Models
    if (!map.getLayer('3d-buses-stl-layer')) {
      setupThreeLayer(map);
    }
  };

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = getProviderMapStyle(mapProvider, theme, maptilerKey);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: CHENNAI_CENTER,
      zoom: 12.2,
      pitch: 50,
      bearing: -10,
      maxPitch: 85,
    });

    mapRef.current = map;

    map.on('mousemove', (e) => {
      setHoveredCoord([
        Number(e.lngLat.lng.toFixed(5)),
        Number(e.lngLat.lat.toFixed(5)),
      ]);
    });

    map.on('load', () => {
      setMapLoaded(true);
      setupMapLayers(map);
    });

    map.on('style.load', () => {
      setupMapLayers(map);
    });

    // Active Bus Click Interaction
    map.on('click', 'bus-markers-halo', (e) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const props = feat.properties as { id: string };
      if (props.id) {
        onSelectBus(props.id);
      }
    });

    map.on('mouseenter', 'bus-markers-halo', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'bus-markers-halo', () => {
      map.getCanvas().style.cursor = '';
    });

    // Interactive Stop Click Popup
    map.on('click', 'stops-outer', (e) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const props = feat.properties as { name: string; code: string; isHub: boolean; routeCode: string };
      const coords = (feat.geometry as unknown as { coordinates: [number, number] }).coordinates;

      new maplibregl.Popup({ closeButton: true, offset: 12 })
        .setLngLat(coords)
        .setHTML(`
          <div class="p-3 font-sans text-xs bg-card text-card-foreground border border-border rounded shadow-xl">
            <div class="flex items-center gap-1.5 mb-1 font-mono text-[10px] text-muted-foreground uppercase">
              <span class="inline-block w-1.5 h-1.5 bg-foreground rounded-full"></span>
              <span>${props.isHub ? 'MAJOR TRANSIT HUB' : 'INTERMEDIATE STOP'}</span>
              <span class="ml-auto font-bold border border-border px-1 py-0.5 rounded">${props.code}</span>
            </div>
            <div class="font-bold text-sm text-foreground">${props.name}</div>
            <div class="mt-1 text-[11px] text-muted-foreground">Connected Routes: <strong class="text-foreground">${props.routeCode}</strong></div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'stops-outer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'stops-outer', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const cachedBusGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const lastAppliedStyleConfigRef = useRef<string>(
    JSON.stringify({ mapProvider, theme, maptilerKey })
  );

  // Update map style only when provider, theme, or maptilerKey actually changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const currentConfig = JSON.stringify({ mapProvider, theme, maptilerKey });
    if (lastAppliedStyleConfigRef.current === currentConfig) return;
    lastAppliedStyleConfigRef.current = currentConfig;
    const newStyle = getProviderMapStyle(mapProvider, theme, maptilerKey);
    mapRef.current.setStyle(newStyle);
  }, [mapProvider, theme, maptilerKey, mapLoaded]);

  // Setup Custom Three.js 3D Layer with STLLoader
  const setupThreeLayer = (map: MapLibreMap) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.Camera;
    let busGeometry: THREE.BufferGeometry | null = cachedBusGeometryRef.current;
    const busMeshes = new Map<string, THREE.Group>();

    const custom3DLayer: CustomLayerInterface = {
      id: '3d-buses-stl-layer',
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (mapInstance, gl) {
        camera = new THREE.Camera();
        scene = new THREE.Scene();

        // High-contrast tactical lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 1.8 : 2.2);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, theme === 'dark' ? 3.0 : 2.5);
        dirLight1.position.set(50, 100, 100).normalize();
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight2.position.set(-50, -50, 50).normalize();
        scene.add(dirLight2);

        renderer = new THREE.WebGLRenderer({
          canvas: mapInstance.getCanvas(),
          context: gl,
          antialias: true,
        });
        renderer.autoClear = false;

        // Load binary STL bus model if not already cached
        if (!cachedBusGeometryRef.current) {
          const loader = new STLLoader();
          loader.load(
            '/models/bus.stl',
            (geometry) => {
              geometry.center();
              geometry.computeBoundingBox();
              if (geometry.boundingBox) {
                const minZ = geometry.boundingBox.min.z;
                // Shift geometry up so the entire bus sits on the road surface (Z >= 0)
                geometry.translate(0, 0, -minZ + 0.1);
              }
              geometry.computeVertexNormals();
              busGeometry = geometry;
              cachedBusGeometryRef.current = geometry;
              setStlModelLoaded(true);
            },
            undefined,
            (err) => {
              console.warn('Fallback bus geometry', err);
              const fallbackGeo = new THREE.BoxGeometry(10.8, 30.0, 14.0);
              fallbackGeo.center();
              fallbackGeo.translate(0, 0, 7.1);
              fallbackGeo.computeVertexNormals();
              busGeometry = fallbackGeo;
              cachedBusGeometryRef.current = fallbackGeo;
              setStlModelLoaded(true);
            }
          );
        }
      },
      render: function (_gl, matrix) {
        const matrixArray = Array.isArray(matrix) ? matrix : (matrix as unknown as { defaultProjectionData?: { mainMatrix: number[] } })?.defaultProjectionData?.mainMatrix || matrix;
        const m = new THREE.Matrix4().fromArray(matrixArray as number[]);
        camera.projectionMatrix = m;

        if (busGeometry) {
          const currentBuses = busesRef.current;
          const currentSelectedBusId = selectedBusIdRef.current;
          const currentSelectedRoute = selectedRouteIdRef.current;

          const activeIds = new Set<string>();

          currentBuses.forEach((bus) => {
            activeIds.add(bus.id);

            const isRouteMatch = !currentSelectedRoute || bus.routeId === currentSelectedRoute;
            const isSelected = bus.id === currentSelectedBusId;

            let group = busMeshes.get(bus.id);

            if (!group && busGeometry) {
              group = new THREE.Group();

              // Solid Vibrant Blue 3D Bus Outer Shell from clean STL
              const material = new THREE.MeshStandardMaterial({
                color: 0x2563eb, // Rich Solid Transit Blue
                metalness: 0.2,
                roughness: 0.35,
                wireframe: false,
                transparent: false,
                opacity: 1.0,
                side: THREE.DoubleSide,
              });

              const mesh = new THREE.Mesh(busGeometry, material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.name = 'bus-body';
              group.add(mesh);

              // Headlights & Taillights at bumper height (Z = 2.5)
              const lightGeo = new THREE.SphereGeometry(0.65, 8, 8);
              const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
              const headLightL = new THREE.Mesh(lightGeo, headLightMat);
              headLightL.position.set(-3.6, 14.6, 2.5);
              const headLightR = new THREE.Mesh(lightGeo, headLightMat);
              headLightR.position.set(3.6, 14.6, 2.5);
              group.add(headLightL);
              group.add(headLightR);

              const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
              const tailLightL = new THREE.Mesh(lightGeo, tailLightMat);
              tailLightL.position.set(-3.6, -14.6, 2.5);
              const tailLightR = new THREE.Mesh(lightGeo, tailLightMat);
              tailLightR.position.set(3.6, -14.6, 2.5);
              group.add(tailLightL);
              group.add(tailLightR);

              // Tactical Selection Radar Ring (Flat at ground Z = 0.2)
              const ringGeo = new THREE.RingGeometry(24, 28, 32);
              const ringMat = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
              });
              const ringMesh = new THREE.Mesh(ringGeo, ringMat);
              ringMesh.position.set(0, 0, 0.2);
              ringMesh.name = 'selection-ring';
              ringMesh.visible = false;
              group.add(ringMesh);

              scene.add(group);
              busMeshes.set(bus.id, group);
            }

            if (group) {
              group.visible = isRouteMatch;
              const isCinematic = bus.id === cinematicBusIdRef.current;
              const isTargeted = isSelected || isCinematic;

              const selectionRing = group.getObjectByName('selection-ring');
              if (selectionRing) {
                // Show selection ring on normal map click, but hide during cinematic hyperloop flight for clean visuals
                selectionRing.visible = isSelected && !isCinematic;
                if (selectionRing.visible) {
                  selectionRing.rotation.z += 0.04;
                }
              }

              const bodyMesh = group.getObjectByName('bus-body') as THREE.Mesh;
              if (bodyMesh && bodyMesh.material) {
                const mat = bodyMesh.material as THREE.MeshStandardMaterial;
                // Section 4: Match bus color with route color
                const routeColorHex = bus.routeCode === '570' ? 0x16a34a : // Green
                                     bus.routeCode === '21G' ? 0x2563eb : // Blue
                                     bus.routeCode === '19B' ? 0x5b3cc4 : // Purple
                                     bus.routeCode === '23C' ? 0x0891b2 : // Teal
                                     0x5b3cc4;

                if (isSelected || isCinematic) {
                  mat.color.set(0x7c3aed); // Bold Purple Selected
                  mat.emissive.set(0x6d28d9);
                } else if (bus.status === 'DELAYED' || bus.delayMinutes > 0) {
                  mat.color.set(0xf59e0b); // Amber Delayed
                  mat.emissive.set(0x78350f);
                } else {
                  mat.color.set(routeColorHex);
                  mat.emissive.set(0x000000);
                }
              }

              const mercatorCoord = maplibregl.MercatorCoordinate.fromLngLat(
                bus.currentCoord,
                0
              );

              // Enhanced scale factor for clean visibility
              const meterScale = mercatorCoord.meterInMercatorCoordinateUnits() * 16.0;
              group.scale.set(meterScale, -meterScale, meterScale);

              const targetPos = new THREE.Vector3(mercatorCoord.x, mercatorCoord.y, mercatorCoord.z);
              const headingRad = (bus.heading * Math.PI) / 180;
              const targetRotZ = headingRad + Math.PI;

              if (!group.userData.initialized) {
                group.position.copy(targetPos);
                group.rotation.set(0, 0, targetRotZ);
                group.userData.initialized = true;
              } else {
                // Smooth interpolation between discrete telemetry ticks
                group.position.lerp(targetPos, 0.35);

                // Shortest angular rotation lerp
                const angleDiff = ((targetRotZ - group.rotation.z + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                group.rotation.z += angleDiff * 0.35;
              }
            }
          });

          busMeshes.forEach((meshGroup, id) => {
            if (!activeIds.has(id)) {
              scene.remove(meshGroup);
              busMeshes.delete(id);
            }
          });
        }

        _gl.enable(_gl.DEPTH_TEST);
        _gl.depthFunc(_gl.LEQUAL);
        _gl.depthMask(true);

        renderer.resetState();
        renderer.render(scene, camera);
        map.triggerRepaint();
      },
    };

    map.addLayer(custom3DLayer);
  };

  // Toggle Buffer corridor layer visibility
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    if (map.getLayer('route-buffers')) {
      map.setLayoutProperty(
        'route-buffers',
        'visibility',
        showBuffers ? 'visible' : 'none'
      );
    }
  }, [showBuffers, mapLoaded]);

  // Toggle 3D pitch
  const toggle3DView = () => {
    if (!mapRef.current) return;
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);
    is3DRef.current = nextIs3D;
    mapRef.current.easeTo({
      pitch: nextIs3D ? 55 : 0,
      bearing: nextIs3D ? -15 : 0,
      duration: 1000,
    });
  };

  // Fly to Chennai Hub
  const flyToHub = (coords: [number, number], zoom = 14) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: coords,
      zoom,
      pitch: is3D ? 50 : 0,
      speed: 1.2,
    });
  };

  // Reset Camera to Initial Network Overview
  const resetToInitialView = () => {
    onSelectBus(null);
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: CHENNAI_CENTER,
      zoom: 12.2,
      pitch: is3D ? 50 : 0,
      bearing: is3D ? -10 : 0,
      speed: 1.2,
      curve: 1.4,
    });
  };

  // Keyboard shortcut (Escape) to reset view when a bus is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBusId) {
        resetToInitialView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBusId, is3D]);

  const activeSelectedBus = activeBuses.find((b) => b.id === selectedBusId);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Tactical Reset Zoom Button (Active when a bus is zoomed into / selected) */}
      {selectedBusId && !cinematicBusId && (
        <div className="absolute top-3 right-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={resetToInitialView}
            className="flex items-center gap-2 px-3.5 py-2 bg-card/95 hover:bg-foreground hover:text-background text-foreground backdrop-blur-md border-2 border-foreground rounded-md shadow-2xl font-mono text-xs font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
            title="Zoom out to initial city overview (Esc)"
          >
            <ZoomOut className="w-4 h-4 transition-transform group-hover:-scale-x-100" />
            <span className="tracking-wide">OVERVIEW // RESET ZOOM</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-foreground/10 group-hover:bg-background/20 text-foreground group-hover:text-background rounded font-mono border border-border group-hover:border-transparent">
              ESC
            </kbd>
          </button>
        </div>
      )}

      {/* Top Left Floating Tactical Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-card/90 backdrop-blur-md border border-border rounded-md shadow-lg">
          <button
            onClick={toggle3DView}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
              is3D
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'hover:bg-primary/10 text-foreground'
            }`}
            title="Toggle 3D Isometric Tactical View"
          >
            <Compass className={`w-3.5 h-3.5 ${is3D ? 'animate-spin-slow' : ''}`} />
            <span>{is3D ? '3D PITCH: 55°' : '2D OVERVIEW'}</span>
          </button>

          <button
            onClick={onToggleBuffers}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded transition-colors ${
              showBuffers
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'hover:bg-primary/10 text-foreground'
            }`}
            title="Toggle PostGIS 50m Safety Buffer Halo"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>50M BUFFER</span>
          </button>
        </div>

        {/* Quick Map Provider Selector */}
        <div className="flex items-center gap-1 p-1 bg-card/90 backdrop-blur-md border border-border rounded-md shadow-lg font-mono text-[11px]">
          <Layers className="w-3.5 h-3.5 text-muted-foreground ml-1 mr-0.5" />
          <select
            value={mapProvider}
            onChange={(e) => onSetMapProvider(e.target.value as MapProviderId)}
            className="bg-transparent text-foreground text-xs font-mono font-medium focus:outline-none cursor-pointer pr-2"
          >
            {MAP_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id} className="bg-card text-foreground">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Hub Jump Selector */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-card/90 backdrop-blur-md border border-border rounded-md shadow-lg text-[11px] font-mono">
          <span className="px-2 text-muted-foreground font-semibold">HUBS:</span>
          {CHENNAI_HUBS.slice(0, 5).map((hub) => (
            <button
              key={hub.code}
              onClick={() => flyToHub(hub.coordinates)}
              className="px-2 py-1 hover:bg-accent rounded text-foreground transition-colors font-medium"
            >
              {hub.code}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Left Minimal Route Legend */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-3 px-3 py-1.5 bg-card/90 backdrop-blur-xs border border-border rounded-lg shadow-xs font-mono text-[10px] text-muted-foreground select-none">
        <span className="flex items-center space-x-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: theme === 'dark' ? '#ffffff' : '#7C69A5' }} 
          />
          <span className="text-foreground font-semibold">
            {theme === 'dark' ? 'Routes (White)' : 'Corridor (Lavender)'}
          </span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5B3CC4]" />
          <span className="text-foreground font-semibold">Selected</span>
        </span>
      </div>

      {/* Minimal Bus Popover on Selection (Section 5: Summary First, Details on Demand) */}
      {activeSelectedBus && !cinematicBusId && (
        <div className="absolute top-14 left-3 z-30 w-64 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-3 text-xs font-sans animate-in fade-in select-none">
          <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
            <div className="flex items-center space-x-2">
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ 
                  backgroundColor: activeSelectedBus.routeCode === '570' ? '#16A34A' : 
                                  activeSelectedBus.routeCode === '21G' ? '#2563EB' : 
                                  activeSelectedBus.routeCode === '19B' ? '#5B3CC4' : '#0891B2' 
                }} 
              />
              <strong className="text-foreground font-mono">{activeSelectedBus.id}</strong>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-bold">
                {activeSelectedBus.routeCode}
              </span>
            </div>
            <button
              onClick={resetToInitialView}
              className="text-muted-foreground hover:text-foreground text-sm cursor-pointer p-0.5 leading-none"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver:</span>
              <strong className="text-foreground">{activeSelectedBus.driverName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duty:</span>
              <strong className="text-foreground">08:30 → 12:30</strong>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-bold ${activeSelectedBus.delayMinutes > 0 ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {activeSelectedBus.delayMinutes > 0 ? `Delayed (+${activeSelectedBus.delayMinutes}m)` : 'On Time'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChennaiTransitMap;
