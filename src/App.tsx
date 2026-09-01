import React, { useState, useEffect, useRef } from 'react';
import { CHENNAI_ROUTES, INITIAL_BUSES, INITIAL_KPIS } from './data/chennaiRoutes';
import { ActiveBus, FleetKPIs, TransitRoute, MapProviderId } from './types/transit';
import { interpolateRoutePosition, getDistanceMeters } from './utils/geoUtils';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { ChennaiTransitMap } from './components/Map/ChennaiTransitMap';
import { RightSidepanel } from './components/Sidepanel/RightSidepanel';
import { DriverPortal } from './components/Driver/DriverPortal';

function computeBusTelemetry(
  bus: ActiveBus,
  route: TransitRoute,
  progress: number,
  direction: 1 | -1
): Partial<ActiveBus> {
  const { coord, heading: forwardHeading } = interpolateRoutePosition(
    route.coordinates,
    progress
  );

  // If the bus is traveling backward along the route (direction -1), flip heading 180 degrees
  const heading = direction === -1 ? (forwardHeading + 180) % 360 : forwardHeading;

  // Find closest stop
  let closestStop = route.stops[0];
  let minStopDist = Infinity;
  route.stops.forEach((stop) => {
    const dist = getDistanceMeters(coord, stop.coordinates);
    if (dist < minStopDist) {
      minStopDist = dist;
      closestStop = stop;
    }
  });

  const etaMins = Number(((minStopDist / ((bus.speedKmH * 1000) / 60))).toFixed(1));

  return {
    currentCoord: coord,
    heading,
    progressAlongRoute: progress,
    direction,
    distanceToNextStopM: Math.round(minStopDist),
    nextStopName: closestStop.name,
    nextStopEtaMinutes: etaMins > 0 ? etaMins : 0.5,
  };
}

function initializeBuses(initialBuses: ActiveBus[], routes: TransitRoute[]): ActiveBus[] {
  return initialBuses.map((bus) => {
    const route = routes.find((r) => r.id === bus.routeId);
    if (!route || route.coordinates.length < 2) return bus;
    const telemetry = computeBusTelemetry(
      bus,
      route,
      bus.progressAlongRoute,
      bus.direction
    );
    return {
      ...bus,
      ...telemetry,
    };
  });
}

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mapProvider, setMapProvider] = useState<MapProviderId>('carto');
  const [maptilerKey, setMaptilerKey] = useState<string>('');
  const [routes] = useState<TransitRoute[]>(CHENNAI_ROUTES);
  const [buses, setBuses] = useState<ActiveBus[]>(() =>
    initializeBuses(INITIAL_BUSES, CHENNAI_ROUTES)
  );
  const [kpis] = useState<FleetKPIs>(INITIAL_KPIS);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  const lastTickRef = useRef<number>(Date.now());

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Real-Time Bus Animation & Telemetry Loop (for homepage)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const route = routes.find((r) => r.id === bus.routeId);
          if (!route || route.coordinates.length < 2) return bus;

          // Compute progress increment based on bus speed & sim multiplier
          const totalDistanceM = route.totalDistanceKm * 1000;
          const speedMeterPerSec = (bus.speedKmH * 1000) / 3600;
          const distCovered = speedMeterPerSec * deltaSec * simSpeed * 4; // visual speed scale
          const progressDelta = distCovered / totalDistanceM;

          let nextProgress = bus.progressAlongRoute + progressDelta * bus.direction;
          let nextDirection = bus.direction;

          // Ping pong at ends of route
          if (nextProgress >= 1) {
            nextProgress = 1;
            nextDirection = -1;
          } else if (nextProgress <= 0) {
            nextProgress = 0;
            nextDirection = 1;
          }

          const telemetry = computeBusTelemetry(
            bus,
            route,
            nextProgress,
            nextDirection
          );

          return {
            ...bus,
            ...telemetry,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, routes]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleResetSim = () => {
    setBuses(initializeBuses(INITIAL_BUSES, routes));
  };

  // If path is /driver, render the dedicated Driver Portal
  if (currentPath.startsWith('/driver')) {
    return (
      <DriverPortal
        onNavigateHome={() => navigateTo('/')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        maptilerKey={maptilerKey}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navbar */}
      <TopNavbar activeBusCount={buses.length} />

      {/* Single Page Layout: Map on Left (70%) and Options Panel on Right (30%) */}
      <div className="flex-1 w-full h-[calc(100vh-3rem)] overflow-hidden">
        <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
          {/* Left Spatial Map Canvas */}
          <main className="w-full lg:w-[68%] xl:w-[72%] h-[60%] lg:h-full relative overflow-hidden">
            <ChennaiTransitMap
              routes={routes}
              activeBuses={buses}
              selectedBusId={selectedBusId}
              onSelectBus={setSelectedBusId}
              selectedRouteId={selectedRouteId}
              theme={theme}
              showBuffers={showBuffers}
              onToggleBuffers={() => setShowBuffers(!showBuffers)}
              mapProvider={mapProvider}
              onSetMapProvider={setMapProvider}
              maptilerKey={maptilerKey}
            />
          </main>

          {/* Right Options Sidepanel */}
          <aside className="w-full lg:w-[32%] xl:w-[28%] h-[40%] lg:h-full overflow-hidden">
            <RightSidepanel
              onNavigateDriver={() => navigateTo('/driver')}
              onNavigateAdmin={() => navigateTo('/admin')}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
