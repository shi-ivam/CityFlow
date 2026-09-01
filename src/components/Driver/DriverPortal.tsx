import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchDrivers,
  fetchDriverAssignedRoute,
  fetchDriverShift,
  fetchDriverFatigue,
  fetchDriverNextShift,
  fetchShiftChangeRequests,
  DriverSummary,
  DriverAssignedRouteResponse,
  ShiftDurationResponse,
  FatigueResponse,
  NextShiftAllocationResponse,
  ShiftChangeRequest,
} from '../../services/api';
import { DriverNavbar } from './DriverNavbar';
import { DriverRouteMap } from './DriverRouteMap';
import { DriverShiftDuration } from './DriverShiftDuration';
import { DriverFatigueCard } from './DriverFatigueCard';
import { NextShiftAllocation } from './NextShiftAllocation';
import { ShiftChangeHistory } from './ShiftChangeHistory';
import { ShiftChangeModal } from './ShiftChangeModal';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface DriverPortalProps {
  onNavigateHome: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  maptilerKey?: string;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  onNavigateHome,
  theme,
  onToggleTheme,
  maptilerKey = 'get_your_own_OpIi9ZULNHzrESv6T2vL',
}) => {
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('DRV-7402');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Driver Telemetry States
  const [assignedRouteData, setAssignedRouteData] = useState<DriverAssignedRouteResponse | null>(null);
  const [shiftData, setShiftData] = useState<ShiftDurationResponse | null>(null);
  const [fatigueData, setFatigueData] = useState<FatigueResponse | null>(null);
  const [nextShiftData, setNextShiftData] = useState<NextShiftAllocationResponse | null>(null);
  const [shiftRequests, setShiftRequests] = useState<ShiftChangeRequest[]>([]);

  // Shift Change Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);

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
                  telemetry={assignedRouteData.telemetry}
                  theme={theme}
                  maptilerKey={maptilerKey}
                />
              )}
            </main>

            {/* Right Telemetry & Shift Deck (42%) */}
            <aside className="w-full lg:w-[42%] xl:w-[40%] h-[52%] lg:h-full overflow-y-auto p-4 space-y-4 bg-background">
              {/* 1. Shift Duration Monitor */}
              {shiftData && <DriverShiftDuration initialShift={shiftData} />}

              {/* 2. Fatigue Level Telemetry */}
              {fatigueData && <DriverFatigueCard fatigue={fatigueData} />}

              {/* 3. Next Shift Allocation */}
              {nextShiftData && <NextShiftAllocation nextShift={nextShiftData} />}

              {/* 4. Shift Change Request History */}
              <ShiftChangeHistory
                requests={shiftRequests}
                onRefresh={handleRefresh}
                onRequestNew={() => setIsShiftModalOpen(true)}
              />
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
