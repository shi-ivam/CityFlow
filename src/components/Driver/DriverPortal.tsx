import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDrivers,
  fetchDriverAssignedRoute,
  fetchDriverShift,
  fetchDriverFatigue,
  fetchDriverNextShift,
  fetchShiftChangeRequests,
  DriverSummary,
  DriverAssignedRouteResponse,
  DriverTelemetry,
  ShiftDurationResponse,
  FatigueResponse,
  NextShiftAllocationResponse,
  ShiftChangeRequest,
} from '../../services/api';
import { interpolateRoutePosition, getDistanceMeters } from '../../utils/geoUtils';
import { DriverNavbar } from './DriverNavbar';
import { DriverRouteMap } from './DriverRouteMap';
import { DriverModuleMenu, DriverModuleId } from './DriverModuleMenu';
import { Module1ShiftDuty } from './modules/Module1ShiftDuty';
import { Module2FatigueRotation } from './modules/Module2FatigueRotation';
import { Module3ActiveTrip } from './modules/Module3ActiveTrip';
import { Module4PassengerOverflow } from './modules/Module4PassengerOverflow';
import { Module5DriverRelief } from './modules/Module5DriverRelief';
import { Module6ReturnTransport } from './modules/Module6ReturnTransport';
import { Module7CommsAlerts } from './modules/Module7CommsAlerts';
import { ShiftChangeModal } from './ShiftChangeModal';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface DriverPortalProps {
  onNavigateHome: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  maptilerKey?: string;
  initialDriverId?: string;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  onNavigateHome,
  theme,
  onToggleTheme,
  maptilerKey = 'get_your_own_OpIi9ZULNHzrESv6T2vL',
  initialDriverId,
}) => {
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    if (initialDriverId) return initialDriverId;
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('driverId');
    return fromUrl || 'DRV-7402';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Driver Telemetry States
  const [assignedRouteData, setAssignedRouteData] = useState<DriverAssignedRouteResponse | null>(null);
  const [liveTelemetry, setLiveTelemetry] = useState<DriverTelemetry | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const [shiftData, setShiftData] = useState<ShiftDurationResponse | null>(null);
  const [fatigueData, setFatigueData] = useState<FatigueResponse | null>(null);
  const [nextShiftData, setNextShiftData] = useState<NextShiftAllocationResponse | null>(null);
  const [shiftRequests, setShiftRequests] = useState<ShiftChangeRequest[]>([]);

  // Shift Change Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);

  // Active FEATURES.md Module on Right Sidebar
  const [activeModule, setActiveModule] = useState<DriverModuleId>('module1');

  // 1. Fetch Drivers List on mount
  useEffect(() => {
    async function loadDrivers() {
      try {
        const list = await fetchDrivers();
        setDrivers(list);
        if (list.length > 0 && !selectedDriverId) {
          setSelectedDriverId(list[0].driverId);
        }
      } catch (err: any) {
        console.error('Failed to load drivers:', err);
        setError('Failed to connect to Python backend. Ensure FastAPI server is running on port 8000.');
      }
    }
    loadDrivers();
  }, []);

  // 2. Fetch all telemetry for the selected driver
  const loadDriverTelemetry = useCallback(async (driverId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [routeRes, shiftRes, fatigueRes, nextShiftRes, requestsRes] = await Promise.all([
        fetchDriverAssignedRoute(driverId),
        fetchDriverShift(driverId),
        fetchDriverFatigue(driverId),
        fetchDriverNextShift(driverId),
        fetchShiftChangeRequests(driverId),
      ]);

      setAssignedRouteData(routeRes);
      setLiveTelemetry(routeRes.telemetry);
      setShiftData(shiftRes);
      setFatigueData(fatigueRes);
      setNextShiftData(nextShiftRes);
      setShiftRequests(requestsRes);
    } catch (err: any) {
      console.error(`Error loading telemetry for ${driverId}:`, err);
      setError(err.message || 'Failed to fetch driver telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDriverId) {
      loadDriverTelemetry(selectedDriverId);
    }
  }, [selectedDriverId, loadDriverTelemetry]);

  // Real-Time Bus Telemetry Simulation Loop along assigned route
  useEffect(() => {
    if (!assignedRouteData || !assignedRouteData.route) return;
    const route = assignedRouteData.route;
    if (route.coordinates.length < 2) return;

    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setLiveTelemetry((prev) => {
        if (!prev) return prev;

        const totalDistanceM = (route.totalDistanceKm || 15) * 1000;
        const speedMeterPerSec = (prev.speedKmH * 1000) / 3600;
        const distCovered = speedMeterPerSec * deltaSec * 3.5; // smooth visual speed scale
        const progressDelta = distCovered / totalDistanceM;

        let nextProgress = (prev.progressAlongRoute || 0) + progressDelta * (prev.direction || 1);
        let nextDirection = prev.direction || 1;

        if (nextProgress >= 1) {
          nextProgress = 1;
          nextDirection = -1;
        } else if (nextProgress <= 0) {
          nextProgress = 0;
          nextDirection = 1;
        }

        const { coord, heading: forwardHeading } = interpolateRoutePosition(
          route.coordinates,
          nextProgress
        );

        const heading = nextDirection === -1 ? (forwardHeading + 180) % 360 : forwardHeading;

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

        const etaMins = Number(((minStopDist / ((prev.speedKmH * 1000) / 60))).toFixed(1));

        return {
          ...prev,
          currentCoord: coord,
          heading,
          progressAlongRoute: nextProgress,
          direction: nextDirection,
          distanceToNextStopM: Math.round(minStopDist),
          nextStopName: closestStop ? closestStop.name : prev.nextStopName,
          nextStopEtaMinutes: etaMins > 0 ? etaMins : 0.5,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [assignedRouteData?.route?.id]);

  const handleRequestSubmitted = (newRequest: ShiftChangeRequest) => {
    setShiftRequests((prev) => [newRequest, ...prev]);
  };

  const handleRefresh = () => {
    if (selectedDriverId) {
      loadDriverTelemetry(selectedDriverId);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground font-sans">
      {/* Tactical Navbar */}
      <DriverNavbar
        drivers={drivers}
        selectedDriverId={selectedDriverId}
        onSelectDriver={setSelectedDriverId}
        driverProfile={assignedRouteData?.driver || null}
        onNavigateHome={onNavigateHome}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onRequestShiftChange={() => setIsShiftModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded max-w-md space-y-3 font-mono text-xs">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <div className="font-bold text-sm">BACKEND CONNECTION ERROR</div>
              <div>{error}</div>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-foreground text-background font-bold uppercase rounded hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : loading && !assignedRouteData ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground font-mono text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
            <span>CONNECTING TO TRANSIT TELEMETRY ENGINE...</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Left Spatial Route Canvas (58%) */}
            <main className="w-full lg:w-[58%] xl:w-[60%] h-[48%] lg:h-full relative overflow-hidden border-b lg:border-b-0 lg:border-r border-border">
              {assignedRouteData && (
                <DriverRouteMap
                  route={assignedRouteData.route}
                  telemetry={liveTelemetry || assignedRouteData.telemetry}
                  theme={theme}
                  maptilerKey={maptilerKey}
                />
              )}
            </main>

            {/* Right Telemetry & Shift Deck (42%) */}
            <aside className="w-full lg:w-[42%] xl:w-[40%] h-[52%] lg:h-full overflow-y-auto p-3 sm:p-4 space-y-4 bg-background">
              {/* Menu with square blocks corresponding to FEATURES.md Todos */}
              <DriverModuleMenu
                activeModule={activeModule}
                onSelectModule={setActiveModule}
              />

              {/* Dynamic Module Content based on selected square block */}
              {activeModule === 'module1' && (
                <Module1ShiftDuty
                  driverProfile={assignedRouteData?.driver || null}
                  shiftData={shiftData}
                  shiftRequests={shiftRequests}
                  onRefresh={handleRefresh}
                  onRequestShiftChange={() => setIsShiftModalOpen(true)}
                />
              )}

              {activeModule === 'module2' && (
                <Module2FatigueRotation
                  fatigueData={fatigueData}
                  nextShiftData={nextShiftData}
                />
              )}

              {activeModule === 'module3' && (
                <Module3ActiveTrip
                  assignedRouteData={assignedRouteData}
                  telemetry={liveTelemetry || assignedRouteData?.telemetry || null}
                />
              )}

              {activeModule === 'module4' && (
                <Module4PassengerOverflow
                  currentStopName={liveTelemetry?.nextStopName || 'Saidapet Metro / Bus Stop'}
                />
              )}

              {activeModule === 'module5' && (
                <Module5DriverRelief
                  driverName={assignedRouteData?.driver?.name}
                  driverId={assignedRouteData?.driver?.driverId}
                />
              )}

              {activeModule === 'module6' && (
                <Module6ReturnTransport
                  homeDepot={`${assignedRouteData?.driver?.depot || 'Central'} Depot (Chennai)`}
                />
              )}

              {activeModule === 'module7' && (
                <Module7CommsAlerts />
              )}
            </aside>
          </div>
        )}
      </div>

      {/* Shift Change Request Modal */}
      {assignedRouteData && (
        <ShiftChangeModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          driverProfile={assignedRouteData.driver}
          allDrivers={drivers}
          onRequestSubmitted={handleRequestSubmitted}
        />
      )}
    </div>
  );
};
