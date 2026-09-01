import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, CustomLayerInterface } from 'maplibre-gl';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TransitRoute, Coordinates } from '../../types/transit';
import { DriverTelemetry } from '../../services/api';
import { MapPin, Target, Route as RouteIcon, Compass } from 'lucide-react';

interface DriverRouteMapProps {
  route: TransitRoute;
  telemetry: DriverTelemetry;
  theme: 'dark' | 'light';
  maptilerKey?: string;
}

function getMapStyle(theme: 'dark' | 'light', maptilerKey = '') {
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
  const telemetryRef = useRef<DriverTelemetry>(telemetry);
  const is3DRef = useRef<boolean>(true);
  const cachedBusGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  const [is3D, setIs3D] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [stlLoaded, setStlLoaded] = useState<boolean>(false);

  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  const setupThree3DLayer = (map: MapLibreMap) => {
    if (map.getLayer('driver-3d-bus-stl-layer')) return;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.Camera;
    let busGeometry: THREE.BufferGeometry | null = cachedBusGeometryRef.current;
    let busGroup: THREE.Group | null = null;

    const custom3DLayer: CustomLayerInterface = {
      id: 'driver-3d-bus-stl-layer',
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (mapInstance, gl) {
        camera = new THREE.Camera();
        scene = new THREE.Scene();

        const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 2.0 : 2.4);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, theme === 'dark' ? 3.2 : 2.8);
        dirLight1.position.set(50, 100, 100).normalize();
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.8);
        dirLight2.position.set(-50, -50, 50).normalize();
        scene.add(dirLight2);

        renderer = new THREE.WebGLRenderer({
          canvas: mapInstance.getCanvas(),
          context: gl,
          antialias: true,
        });
        renderer.autoClear = false;

        if (!cachedBusGeometryRef.current) {
          const loader = new STLLoader();
          loader.load(
            '/models/bus.stl',
            (geometry) => {
              geometry.center();
              geometry.computeBoundingBox();
              if (geometry.boundingBox) {
                const minZ = geometry.boundingBox.min.z;
                geometry.translate(0, 0, -minZ + 0.1);
              }
              geometry.computeVertexNormals();
              busGeometry = geometry;
              cachedBusGeometryRef.current = geometry;
              setStlLoaded(true);
            },
            undefined,
            (err) => {
              console.warn('Fallback driver bus geometry', err);
              const fallbackGeo = new THREE.BoxGeometry(10.8, 30.0, 14.0);
              fallbackGeo.center();
              fallbackGeo.translate(0, 0, 7.1);
              fallbackGeo.computeVertexNormals();
              busGeometry = fallbackGeo;
              cachedBusGeometryRef.current = fallbackGeo;
              setStlLoaded(true);
            }
          );
        } else {
          busGeometry = cachedBusGeometryRef.current;
          setStlLoaded(true);
        }
      },
      render: function (_gl, matrix) {
        const matrixArray = Array.isArray(matrix)
          ? matrix
          : (matrix as unknown as { defaultProjectionData?: { mainMatrix: number[] } })
              ?.defaultProjectionData?.mainMatrix || matrix;
        const m = new THREE.Matrix4().fromArray(matrixArray as number[]);
        camera.projectionMatrix = m;

        if (busGeometry) {
          const currentTel = telemetryRef.current;

          if (!busGroup) {
            busGroup = new THREE.Group();

            const material = new THREE.MeshStandardMaterial({
              color: 0x2563eb,
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
            mesh.name = 'driver-bus-body';
            busGroup.add(mesh);

            const lightGeo = new THREE.SphereGeometry(0.65, 8, 8);
            const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const headLightL = new THREE.Mesh(lightGeo, headLightMat);
            headLightL.position.set(-3.6, 14.6, 2.5);
            const headLightR = new THREE.Mesh(lightGeo, headLightMat);
            headLightR.position.set(3.6, 14.6, 2.5);
            busGroup.add(headLightL);
            busGroup.add(headLightR);

            const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            const tailLightL = new THREE.Mesh(lightGeo, tailLightMat);
            tailLightL.position.set(-3.6, -14.6, 2.5);
            const tailLightR = new THREE.Mesh(lightGeo, tailLightMat);
            tailLightR.position.set(3.6, -14.6, 2.5);
            busGroup.add(tailLightL);
            busGroup.add(tailLightR);

            const ringGeo = new THREE.RingGeometry(24, 28, 32);
            const ringMat = new THREE.MeshBasicMaterial({
              color: 0x38bdf8,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.9,
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.position.set(0, 0, 0.2);
            ringMesh.name = 'driver-selection-ring';
            busGroup.add(ringMesh);

            scene.add(busGroup);
          }

          if (busGroup) {
            const selectionRing = busGroup.getObjectByName('driver-selection-ring');
            if (selectionRing) {
              selectionRing.rotation.z += 0.04;
            }

            const mercatorCoord = maplibregl.MercatorCoordinate.fromLngLat(
              currentTel.currentCoord,
              0
            );

            const meterScale = mercatorCoord.meterInMercatorCoordinateUnits() * 16.0;
            busGroup.scale.set(meterScale, -meterScale, meterScale);

            const targetPos = new THREE.Vector3(mercatorCoord.x, mercatorCoord.y, mercatorCoord.z);
            const headingRad = (currentTel.heading * Math.PI) / 180;
            const targetRotZ = headingRad + Math.PI;

            if (!busGroup.userData.initialized) {
              busGroup.position.copy(targetPos);
              busGroup.rotation.set(0, 0, targetRotZ);
              busGroup.userData.initialized = true;
            } else {
              busGroup.position.lerp(targetPos, 0.35);
              const angleDiff =
                ((targetRotZ - busGroup.rotation.z + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
              busGroup.rotation.z += angleDiff * 0.35;
            }
          }
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

  // Setup Map Layers with GPU GeoJSON Stops
  const setupLayers = (map: MapLibreMap) => {
    // 1. Add Route GeoJSON Source
    if (!map.getSource('driver-route')) {
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
    }

    // Route Outer Safety Corridor (Halo)
    if (!map.getLayer('driver-route-halo')) {
      map.addLayer({
        id: 'driver-route-halo',
        type: 'line',
        source: 'driver-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': theme === 'dark' ? '#ffffff' : '#000000',
          'line-width': 18,
          'line-opacity': theme === 'dark' ? 0.08 : 0.05,
        },
      });
    }

    // Route Base Casing
    if (!map.getLayer('driver-route-casing')) {
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
          'line-opacity': 0.35,
        },
      });
    }

    // Clean Solid High-Contrast Route Main Line
    if (!map.getLayer('driver-route-main')) {
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
    }

    // 2. Add Stops GeoJSON Source (Hardware-accelerated GPU layer - 0% drift on zoom/pitch)
    if (!map.getSource('driver-route-stops')) {
      const stopFeatures = route.stops.map((stop, idx) => ({
        type: 'Feature' as const,
        properties: {
          id: stop.id,
          name: stop.name,
          code: stop.code,
          isHub: stop.isHub || false,
          stopSequence: idx + 1,
          isNextStop: stop.name.toLowerCase() === telemetry.nextStopName.toLowerCase(),
        },
        geometry: {
          type: 'Point' as const,
          coordinates: stop.coordinates,
        },
      }));

      map.addSource('driver-route-stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stopFeatures,
        },
      });
    }

    // Stop Outer Ring (GPU rendered circle)
    if (!map.getLayer('driver-stops-outer')) {
      map.addLayer({
        id: 'driver-stops-outer',
        type: 'circle',
        source: 'driver-route-stops',
        paint: {
          'circle-radius': ['case', ['get', 'isHub'], 6.5, 4.5],
          'circle-color': theme === 'dark' ? '#000000' : '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': theme === 'dark' ? '#ffffff' : '#000000',
        },
      });
    }

    // Stop Inner Dot
    if (!map.getLayer('driver-stops-inner')) {
      map.addLayer({
        id: 'driver-stops-inner',
        type: 'circle',
        source: 'driver-route-stops',
        paint: {
          'circle-radius': ['case', ['get', 'isHub'], 3.2, 2],
          'circle-color': theme === 'dark' ? '#ffffff' : '#000000',
        },
      });
    }

    // Next Stop Highlight Ring
    if (!map.getLayer('driver-next-stop-halo')) {
      map.addLayer({
        id: 'driver-next-stop-halo',
        type: 'circle',
        source: 'driver-route-stops',
        filter: ['==', ['get', 'isNextStop'], true],
        paint: {
          'circle-radius': 11,
          'circle-color': 'transparent',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': theme === 'dark' ? '#38bdf8' : '#0284c7',
          'circle-stroke-opacity': 0.9,
        },
      });
    }

    // Hit Area for Clean Interactive Stop Popups
    if (!map.getLayer('driver-stops-hitarea')) {
      map.addLayer({
        id: 'driver-stops-hitarea',
        type: 'circle',
        source: 'driver-route-stops',
        paint: {
          'circle-radius': 16,
          'circle-color': '#000000',
          'circle-opacity': 0,
        },
      });
    }

    // 3. Setup Three.js 3D STL Layer
    setupThree3DLayer(map);
  };

  const fitRouteBounds = (map: MapLibreMap, coords: Coordinates[], animate = true) => {
    if (!coords || coords.length === 0) return;
    if (coords.length === 1) {
      map.flyTo({ center: coords[0], zoom: 12.2, pitch: is3DRef.current ? 48 : 0 });
      return;
    }
    const bounds = coords.reduce(
      (acc, coord) => acc.extend(coord),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 85, left: 45, right: 45 },
      pitch: is3DRef.current ? 48 : 0,
      bearing: is3DRef.current ? -10 : 0,
      maxZoom: 13.0,
      duration: animate ? 800 : 0,
    });
  };

  // 1. Initialize Map with Zoomed-Out Overview
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCoord = telemetry.currentCoord || route.coordinates[0] || [80.23, 13.035];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyle(theme, maptilerKey),
      center: initialCoord,
      zoom: 12.2,
      pitch: is3D ? 48 : 0,
      bearing: is3D ? -10 : 0,
      maxPitch: 85,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
      setupLayers(map);
      if (route.coordinates.length > 1) {
        fitRouteBounds(map, route.coordinates, false);
      }
    });

    map.on('style.load', () => {
      setupLayers(map);
    });

    // Interactive Stop Click Popup
    map.on('click', 'driver-stops-hitarea', (e) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const props = feat.properties as {
        name: string;
        code: string;
        isHub: boolean;
        stopSequence: number;
        isNextStop: boolean;
      };
      const coords = (feat.geometry as unknown as { coordinates: [number, number] }).coordinates;

      new maplibregl.Popup({ closeButton: true, offset: 10 })
        .setLngLat(coords)
        .setHTML(`
          <div class="p-2.5 font-sans text-xs bg-card text-card-foreground border border-border rounded shadow-xl min-w-[170px]">
            <div class="flex items-center gap-1.5 mb-1 font-mono text-[10px] text-muted-foreground uppercase">
              <span class="inline-block w-1.5 h-1.5 ${props.isNextStop ? 'bg-sky-400' : 'bg-foreground'} rounded-full"></span>
              <span>${props.isNextStop ? 'NEXT UPCOMING STOP' : props.isHub ? 'MAJOR TRANSIT HUB' : 'STOP #' + props.stopSequence}</span>
              <span class="ml-auto font-bold border border-border px-1 py-0.2 rounded">${props.code}</span>
            </div>
            <div class="font-bold text-sm text-foreground">${props.name}</div>
            <div class="mt-1 text-[11px] text-muted-foreground font-mono">
              ${props.isNextStop ? `ETA: <strong class="text-foreground">${telemetryRef.current.nextStopEtaMinutes} min (${telemetryRef.current.distanceToNextStopM}m)</strong>` : `Route Corridor Point #${props.stopSequence}`}
            </div>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'driver-stops-hitarea', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'driver-stops-hitarea', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [route.id, theme]);

  // Update Route Source Data when Route changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const source = map.getSource('driver-route') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates,
        },
      });
      fitRouteBounds(map, route.coordinates, true);
    }
  }, [route.coordinates, mapLoaded]);

  // Update Stops GeoJSON Source dynamically (Zero DOM overhead)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const source = map.getSource('driver-route-stops') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: route.stops.map((stop, idx) => ({
          type: 'Feature',
          properties: {
            id: stop.id,
            name: stop.name,
            code: stop.code,
            isHub: stop.isHub || false,
            stopSequence: idx + 1,
            isNextStop: stop.name.toLowerCase() === telemetry.nextStopName.toLowerCase(),
          },
          geometry: {
            type: 'Point',
            coordinates: stop.coordinates,
          },
        })),
      });
    }

    if (map.getLayer('driver-next-stop-halo')) {
      map.setFilter('driver-next-stop-halo', ['==', ['get', 'isNextStop'], true]);
    }
  }, [route.stops, telemetry.nextStopName, mapLoaded]);

  const toggle3DView = () => {
    if (!mapRef.current) return;
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);
    is3DRef.current = nextIs3D;
    mapRef.current.easeTo({
      pitch: nextIs3D ? 48 : 0,
      bearing: nextIs3D ? -10 : 0,
      duration: 800,
    });
  };

  const handleRecenter = () => {
    if (mapRef.current && telemetry.currentCoord) {
      mapRef.current.flyTo({
        center: telemetry.currentCoord,
        zoom: 13.0,
        pitch: is3D ? 48 : 0,
        bearing: is3D ? -10 : 0,
        speed: 1.2,
        curve: 1.2,
      });
    }
  };

  const handleFitRoute = () => {
    if (mapRef.current) {
      fitRouteBounds(mapRef.current, route.coordinates, true);
    }
  };

  return (
    <div className="relative w-full h-full bg-card overflow-hidden select-none border border-border">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left: Minimal Route Chip */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-card/95 backdrop-blur-md border border-border px-3 py-1.5 rounded shadow-sm text-foreground flex items-center gap-2">
          <span className="font-mono font-black text-xs px-1.5 py-0.5 bg-foreground text-background rounded-sm">
            {route.code}
          </span>
          <span className="font-semibold text-xs text-foreground tracking-tight">
            {route.name}
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-card/90 backdrop-blur-md p-1 border border-border rounded-md shadow-lg">
        <button
          onClick={toggle3DView}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
            is3D
              ? 'bg-foreground text-background font-bold'
              : 'hover:bg-accent text-foreground'
          }`}
          title="Toggle 3D Tactical Perspective / 2D Overview"
        >
          <Compass className={`w-3.5 h-3.5 ${is3D ? 'animate-spin-slow' : ''}`} />
          <span>{is3D ? '3D PITCH: 52°' : '2D OVERVIEW'}</span>
        </button>

        <div className="h-4 w-px bg-border" />

        <button
          onClick={handleRecenter}
          className="p-1.5 hover:bg-accent text-foreground rounded transition-all cursor-pointer"
          title="Recenter & Follow 3D Bus"
        >
          <Target className="w-4 h-4" />
        </button>

        <button
          onClick={handleFitRoute}
          className="p-1.5 hover:bg-accent text-foreground rounded transition-all cursor-pointer"
          title="Fit Full Route"
        >
          <RouteIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10 bg-card/95 backdrop-blur-md border border-border p-3 rounded shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
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

        <div className="flex items-center gap-2.5 font-mono text-xs flex-wrap">
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
            <span className="text-muted-foreground text-[10px] mr-1">HEADING:</span>
            <strong className="text-foreground">{Math.round(telemetry.heading)}°</strong>
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

export default DriverRouteMap;
