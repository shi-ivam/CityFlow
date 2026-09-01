import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, CustomLayerInterface } from 'maplibre-gl';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ActiveBus, TransitRoute, MapProviderId, MAP_PROVIDERS } from '../../types/transit';
import { CHENNAI_CENTER, CHENNAI_HUBS } from '../../data/chennaiRoutes';
import { Compass, ShieldAlert, Navigation2, Zap, User, Clock, Layers } from 'lucide-react';

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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busesRef = useRef<ActiveBus[]>(activeBuses);
  const selectedBusIdRef = useRef<string | null>(selectedBusId);
  const selectedRouteIdRef = useRef<string | null>(selectedRouteId);
  const is3DRef = useRef<boolean>(true);

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

  // Handle selected bus camera focus
  useEffect(() => {
    if (!mapRef.current || !selectedBusId) return;
    const bus = activeBuses.find((b) => b.id === selectedBusId);
    if (bus) {
      mapRef.current.flyTo({
        center: bus.currentCoord,
        zoom: 14.8,
        pitch: is3D ? 55 : 0,
        bearing: bus.heading - 15,
        speed: 1.2,
        curve: 1.4,
      });
    }
  }, [selectedBusId, activeBuses, is3D]);

  // Setup layers helper
  const setupMapLayers = (map: MapLibreMap) => {
    // Add Routes GeoJSON source
    if (!map.getSource('transit-routes')) {
      const routeFeatures = routes.map((r) => ({
        type: 'Feature' as const,
        properties: {
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category,
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

    // Buffer / Corridor Halo Layer (Monochrome 50m buffer)
    if (!map.getLayer('route-buffers')) {
      map.addLayer({
        id: 'route-buffers',
        type: 'line',
        source: 'transit-routes',
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#000000',
          'line-width': 22,
          'line-opacity': theme === 'dark' ? 0.12 : 0.08,
          'line-dasharray': [2, 2],
        },
        layout: {
          visibility: showBuffers ? 'visible' : 'none',
        },
      });
    }

    // Route Casing Layer (Monochrome outline)
    if (!map.getLayer('route-casing')) {
      map.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'transit-routes',
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#000000',
          'line-width': 6,
          'line-opacity': 0.4,
        },
      });
    }

    // Route Main Line (High contrast solid vector)
    if (!map.getLayer('route-main')) {
      map.addLayer({
        id: 'route-main',
        type: 'line',
        source: 'transit-routes',
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#171717',
          'line-width': 3.5,
          'line-opacity': 0.95,
        },
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

  // Update map style when provider, theme, or maptilerKey changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const newStyle = getProviderMapStyle(mapProvider, theme, maptilerKey);
    mapRef.current.setStyle(newStyle);
  }, [mapProvider, theme, maptilerKey, mapLoaded]);

  // Setup Custom Three.js 3D Layer with STLLoader
  const setupThreeLayer = (map: MapLibreMap) => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.Camera;
    let busGeometry: THREE.BufferGeometry | null = null;
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

        // Load binary STL bus model
        const loader = new STLLoader();
        loader.load(
          '/models/bus.stl',
          (geometry) => {
            geometry.center();
            geometry.computeVertexNormals();
            busGeometry = geometry;
            setStlModelLoaded(true);
          },
          undefined,
          (err) => {
            console.warn('Fallback bus geometry', err);
            const fallbackGeo = new THREE.BoxGeometry(10.8, 30.0, 14.0);
            fallbackGeo.center();
            fallbackGeo.computeVertexNormals();
            busGeometry = fallbackGeo;
            setStlModelLoaded(true);
          }
        );
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

              // Solid Vibrant Blue 3D Bus Mesh from clean STL
              const material = new THREE.MeshStandardMaterial({
                color: 0x2563eb, // Rich Solid Transit Blue
                metalness: 0.3,
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

              // Tactical Selection Radar Ring
              const ringGeo = new THREE.RingGeometry(24, 28, 32);
              const ringMat = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
              });
              const ringMesh = new THREE.Mesh(ringGeo, ringMat);
              ringMesh.name = 'selection-ring';
              ringMesh.visible = false;
              group.add(ringMesh);

              scene.add(group);
              busMeshes.set(bus.id, group);
            }

            if (group) {
              group.visible = isRouteMatch;

              const selectionRing = group.getObjectByName('selection-ring');
              if (selectionRing) {
                selectionRing.visible = isSelected;
                if (isSelected) {
                  selectionRing.rotation.z += 0.04;
                }
              }

              const bodyMesh = group.getObjectByName('bus-body') as THREE.Mesh;
              if (bodyMesh && bodyMesh.material) {
                const mat = bodyMesh.material as THREE.MeshStandardMaterial;
                if (isSelected) {
                  mat.color.set(0x60a5fa); // Bright cyan-blue when selected
                  mat.emissive.set(0x1d4ed8);
                } else {
                  mat.color.set(0x2563eb); // Solid rich blue
                  mat.emissive.set(0x000000);
                }
              }

              const mercatorCoord = maplibregl.MercatorCoordinate.fromLngLat(
                bus.currentCoord,
                0
              );

              // Enhanced scale factor for clean visibility
              const meterScale = mercatorCoord.meterInMercatorCoordinateUnits() * 16.0;

              group.position.set(mercatorCoord.x, mercatorCoord.y, mercatorCoord.z);
              group.scale.set(meterScale, -meterScale, meterScale);

              const headingRad = (bus.heading * Math.PI) / 180;
              group.rotation.set(0, 0, headingRad + Math.PI);
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

  const activeSelectedBus = activeBuses.find((b) => b.id === selectedBusId);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Floating Tactical Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-card/90 backdrop-blur-md border border-border rounded-md shadow-lg">
          <button
            onClick={toggle3DView}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
              is3D
                ? 'bg-foreground text-background font-bold'
                : 'hover:bg-accent text-foreground'
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
                ? 'bg-foreground text-background font-bold'
                : 'hover:bg-accent text-foreground'
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

      {/* Bottom Left Live Telemetry Ribbon */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 p-2 bg-card/90 backdrop-blur-md border border-border rounded-md shadow-lg font-mono text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
          </span>
          <span className="text-foreground font-semibold">CHENNAI GIS GRID</span>
        </div>
        <div className="h-3 w-px bg-border"></div>
        <div>
          LNG: <span className="text-foreground tabular-nums">{hoveredCoord[0]}</span> LAT:{' '}
          <span className="text-foreground tabular-nums">{hoveredCoord[1]}</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <div className="h-3 w-px bg-border mr-2"></div>
          <span>PROVIDER:</span>
          <span className="text-foreground font-bold uppercase">{mapProvider}</span>
        </div>
      </div>

      {/* Interactive Active Bus Tactical Overlay Popup (When a bus is selected) */}
      {activeSelectedBus && (
        <div className="absolute top-16 left-3 z-30 w-80 bg-card/95 backdrop-blur-md border-2 border-foreground rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-3 py-2 bg-foreground text-background font-mono text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>LIVE TELEMETRY // {activeSelectedBus.id}</span>
            </div>
            <button
              onClick={() => onSelectBus(null)}
              className="hover:opacity-75 text-sm leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-3.5 space-y-3 font-sans">
            {/* Route & Vehicle Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground uppercase">
                  ROUTE {activeSelectedBus.routeCode}
                </div>
                <div className="text-sm font-bold text-foreground">
                  {routes.find((r) => r.id === activeSelectedBus.routeId)?.name || 'MTC Chennai'}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  Plate: {activeSelectedBus.vehicleNumber}
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                  activeSelectedBus.status === 'ON_TIME'
                    ? 'border border-border bg-accent text-foreground'
                    : activeSelectedBus.status === 'EXPRESS'
                    ? 'bg-foreground text-background'
                    : 'border border-dashed border-foreground/60 text-foreground'
                }`}
              >
                {activeSelectedBus.status.replace('_', ' ')}
              </span>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-secondary/50 rounded border border-border font-mono text-center">
              <div>
                <div className="text-[10px] text-muted-foreground">SPEED</div>
                <div className="text-sm font-bold text-foreground tabular-nums">
                  {activeSelectedBus.speedKmH}{' '}
                  <span className="text-[10px] font-normal">km/h</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">OCCUPANCY</div>
                <div className="text-sm font-bold text-foreground tabular-nums">
                  {activeSelectedBus.occupancyPercent}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">SCHEDULE</div>
                <div className="text-sm font-bold text-foreground tabular-nums">
                  {activeSelectedBus.delayMinutes >= 0
                    ? `+${activeSelectedBus.delayMinutes}m`
                    : `${activeSelectedBus.delayMinutes}m`}
                </div>
              </div>
            </div>

            {/* Next Stop & Driver Info */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Navigation2 className="w-3 h-3" /> Next Stop:
                </span>
                <span className="font-medium text-foreground">
                  {activeSelectedBus.nextStopName}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ETA:
                </span>
                <span className="text-foreground font-semibold">
                  {activeSelectedBus.nextStopEtaMinutes} mins ({activeSelectedBus.distanceToNextStopM}m)
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> Pilot:
                </span>
                <span className="text-foreground font-medium">
                  {activeSelectedBus.driverName} ({activeSelectedBus.driverId})
                </span>
              </div>
            </div>

            {/* Status Footer */}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-muted-foreground font-mono text-[10px]">
              <div className="flex items-center gap-1 text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping"></span>
                <span className="font-bold">LIVE RADAR TRACKING</span>
              </div>
              <button
                onClick={() => onSelectBus(null)}
                className="px-2 py-0.5 rounded border border-border hover:bg-secondary text-foreground text-[10px] cursor-pointer"
              >
                DESELECT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChennaiTransitMap;
