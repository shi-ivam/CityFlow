import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

// ----------------------------------------------------
// 1. Landing Page & Driver Portal Components (Preserved)
// ----------------------------------------------------
import { CHENNAI_ROUTES, INITIAL_BUSES, INITIAL_KPIS } from './data/chennaiRoutes';
import { ActiveBus, FleetKPIs, TransitRoute, MapProviderId } from './types/transit';
import { interpolateRoutePosition, getDistanceMeters } from './utils/geoUtils';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { ChennaiTransitMap } from './components/Map/ChennaiTransitMap';
import { RightSidepanel } from './components/Sidepanel/RightSidepanel';
import { DriverPortal } from './components/Driver/DriverPortal';
import { DriverTransitionOverlay } from './components/Map/DriverTransitionOverlay';

// ----------------------------------------------------
// 2. Admin Progressive Disclosure Modules & Pages
// ----------------------------------------------------
import AdminLayout from './components/admin/AdminLayout';
import AdminModuleHome from './pages/admin/AdminModuleHome';
import DriversModule from './pages/admin/modules/DriversModule';
import VehiclesModule from './pages/admin/modules/VehiclesModule';
import RoutesModule from './pages/admin/modules/RoutesModule';
import ManagementModule from './pages/admin/modules/ManagementModule';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminFleet from './pages/admin/AdminFleet';
import AdminScheduling from './pages/admin/AdminScheduling';
import AdminOperations from './pages/admin/AdminOperations';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminSettings from './pages/admin/AdminSettings';

import FallbackSolverModal from './components/FallbackSolverModal';
import PRDModal from './components/PRDModal';
import AlertToastContainer from './components/admin/AlertToastContainer';

// ----------------------------------------------------
// 3. Master Data, Services & Calculations
// ----------------------------------------------------
import {
  CITIES_DATA,
  INITIAL_DUTIES,
  PROPOSED_ROUTE_TEMPLATES
} from './data/transitData';
import {
  calculateRouteLength,
  calculateNetworkCoverage,
  calculateDeadheadRatio
} from './utils/gisCalculations';
import {
  calculateCrewUtilization,
  detectAllConflicts
} from './utils/dutyEngine';
import * as adminApi from './services/adminApi';

// Centralized LocalStorage Storage Key Helpers
const STORAGE_KEYS = {
  CITY: 'cityflow_selected_city',
  CHENNAI: 'cityflow_store_chennai'
};

function loadStoredCityData(cityName: string = 'chennai') {
  try {
    const key = STORAGE_KEYS.CHENNAI;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to load local storage data", e);
  }
  const defaultCity = (CITIES_DATA as any).chennai || (CITIES_DATA as any).delhi;
  return defaultCity;
}

function saveCityDataToStore(cityName: string = 'chennai', data: any) {
  try {
    const key = STORAGE_KEYS.CHENNAI;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to local storage", e);
  }
}

// ----------------------------------------------------
// Helper: Compute bus telemetry for landing page
// ----------------------------------------------------
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

  const heading = direction === -1 ? (forwardHeading + 180) % 360 : forwardHeading;

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

// ----------------------------------------------------
// LANDING PAGE COMPONENT (Preserved 100%)
// ----------------------------------------------------
const LandingPageComponent: React.FC<{
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}> = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [mapProvider, setMapProvider] = useState<MapProviderId>('carto');
  const [maptilerKey, setMaptilerKey] = useState<string>('');
  const [routes] = useState<TransitRoute[]>(CHENNAI_ROUTES);
  const [buses, setBuses] = useState<ActiveBus[]>(() =>
    initializeBuses(INITIAL_BUSES, CHENNAI_ROUTES)
  );
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Cinematic 3D Transition States
  const [transitionBusId, setTransitionBusId] = useState<string | null>(null);
  const [transitionDriverId, setTransitionDriverId] = useState<string | null>(null);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'intercept' | 'rear_zoom' | 'cockpit_warp' | 'complete'>('idle');
  const transitionTimersRef = useRef<NodeJS.Timeout[]>([]);
  const lastTickRef = useRef<number>(Date.now());

  // Real-Time Bus Animation & Telemetry Loop
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

          const totalDistanceM = route.totalDistanceKm * 1000;
          const speedMeterPerSec = (bus.speedKmH * 1000) / 3600;
          const distCovered = speedMeterPerSec * deltaSec * simSpeed * 4;
          const progressDelta = distCovered / totalDistanceM;

          let nextProgress = bus.progressAlongRoute + progressDelta * bus.direction;
          let nextDirection = bus.direction;

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

  const clearTransitionTimers = () => {
    transitionTimersRef.current.forEach((t) => clearTimeout(t));
    transitionTimersRef.current = [];
  };

  const handleCancelTransition = () => {
    clearTransitionTimers();
    setTransitionBusId(null);
    setTransitionDriverId(null);
    setTransitionStage('idle');
  };

  const handleSkipTransition = () => {
    clearTransitionTimers();
    const targetDriver = transitionDriverId || 'DRV-7402';
    setTransitionBusId(null);
    setTransitionDriverId(null);
    setTransitionStage('idle');
    navigate(`/driver?driverId=${targetDriver}`);
  };

  const handleSelectDriverForTransition = (driverId: string, busId: string) => {
    clearTransitionTimers();
    setTransitionBusId(busId);
    setTransitionDriverId(driverId);
    setSelectedBusId(busId);
    setTransitionStage('intercept');

    const t1 = setTimeout(() => {
      setTransitionStage('rear_zoom');
    }, 750);

    const t2 = setTimeout(() => {
      setTransitionStage('cockpit_warp');
    }, 1700);

    const t3 = setTimeout(() => {
      setTransitionStage('complete');
      navigate(`/driver?driverId=${driverId}`);
      const t4 = setTimeout(() => {
        setTransitionBusId(null);
        setTransitionDriverId(null);
        setTransitionStage('idle');
      }, 400);
      transitionTimersRef.current.push(t4);
    }, 2250);

    transitionTimersRef.current.push(t1, t2, t3);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && transitionStage !== 'idle') {
        handleCancelTransition();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transitionStage]);

  const activeTransitionBus = buses.find((b) => b.id === transitionBusId);
  const activeTransitionRoute = activeTransitionBus
    ? routes.find((r) => r.id === activeTransitionBus.routeId)
    : undefined;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navbar */}
      <TopNavbar activeBusCount={buses.length} />

      {/* Main Single Page Layout */}
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
              cinematicBusId={transitionBusId}
              cinematicStage={transitionStage}
            />

            {/* Holographic 3D Cockpit Warp & Telemetry HUD Overlay */}
            {transitionStage !== 'idle' && activeTransitionBus && (
              <DriverTransitionOverlay
                bus={activeTransitionBus}
                route={activeTransitionRoute}
                stage={transitionStage}
                onCancel={handleCancelTransition}
                onSkip={handleSkipTransition}
              />
            )}
          </main>

          {/* Right Options Sidepanel */}
          <aside className="w-full lg:w-[32%] xl:w-[28%] h-[40%] lg:h-full overflow-hidden">
            <RightSidepanel
              activeBuses={buses}
              onSelectDriverForTransition={handleSelectDriverForTransition}
              onNavigateDriver={(driverId) => {
                if (driverId) {
                  navigate(`/driver?driverId=${driverId}`);
                } else {
                  navigate('/driver');
                }
              }}
              onNavigateAdmin={() => navigate('/admin')}
              isTransitioning={transitionStage !== 'idle'}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// DRIVER PORTAL WRAPPER (Preserved 100%)
// ----------------------------------------------------
const DriverPortalWrapper: React.FC<{
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}> = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const driverIdParam = searchParams.get('driverId') || undefined;

  return (
    <DriverPortal
      onNavigateHome={() => navigate('/')}
      theme={theme}
      onToggleTheme={onToggleTheme}
      initialDriverId={driverIdParam}
    />
  );
};

// ----------------------------------------------------
// ADMIN CONTROL CENTER SUITE (Merged & Backend Linked)
// ----------------------------------------------------
const AdminControlCenter: React.FC<{
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}> = ({ theme, onToggleTheme }) => {
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CITY) || 'chennai';
  });

  const initialCityStore = loadStoredCityData('chennai');

  const [routes, setRoutes] = useState<any[]>(initialCityStore.routes || []);
  const [interchangeHubs, setInterchangeHubs] = useState<any[]>(initialCityStore.hubs || []);
  const [busFleet, setBusFleet] = useState<any[]>(initialCityStore.buses || []);
  const [crewMembers, setCrewMembers] = useState<any[]>(initialCityStore.drivers || []);
  const [trips, setTrips] = useState<any[]>(initialCityStore.trips || (CITIES_DATA as any)[selectedCity]?.trips || []);
  const [dutyAssignments, setDutyAssignments] = useState<any[]>(INITIAL_DUTIES);

  // Operational Simulation Clock State
  const [operationalTime, setOperationalTime] = useState<number>(480); // 08:00 AM in minutes
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Selection & Modal States
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [selectedDutyId, setSelectedDutyId] = useState<string | null>(null);
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState<boolean>(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Route Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to persist current operational state
  const persistCurrentCityStore = (updatedFields: any) => {
    const newStore = {
      routes: updatedFields.routes || routes,
      hubs: updatedFields.hubs || interchangeHubs,
      buses: updatedFields.buses || busFleet,
      drivers: updatedFields.drivers || crewMembers,
      trips: updatedFields.trips || trips,
    };
    saveCityDataToStore(selectedCity, newStore);
  };

  // Fetch live operational data from backend on mount or city change
  const refreshCityData = async (cityName: string) => {
    try {
      const [backendRoutes, backendBuses, backendDrivers, backendHubs, backendTrips, backendDuties] = await Promise.all([
        adminApi.fetchAdminRoutes(cityName),
        adminApi.fetchAdminVehicles(cityName),
        adminApi.fetchAdminDrivers(cityName),
        adminApi.fetchAdminHubs(cityName),
        adminApi.fetchAdminTrips(cityName),
        adminApi.fetchAdminDuties(cityName),
      ]);

      if (backendRoutes && backendRoutes.length > 0) setRoutes(backendRoutes);
      if (backendBuses && backendBuses.length > 0) setBusFleet(backendBuses);
      if (backendDrivers && backendDrivers.length > 0) setCrewMembers(backendDrivers);
      if (backendHubs && backendHubs.length > 0) setInterchangeHubs(backendHubs);
      if (backendTrips && backendTrips.length > 0) setTrips(backendTrips);
      if (backendDuties && backendDuties.length > 0) setDutyAssignments(backendDuties);
    } catch (e) {
      console.debug("Using cached local transit dataset for", cityName);
    }
  };

  useEffect(() => {
    refreshCityData(selectedCity);
  }, [selectedCity]);

  // Synchronize on city change
  const handleSelectCity = (newCity: string) => {
    setSelectedCity(newCity);
    localStorage.setItem(STORAGE_KEYS.CITY, newCity);
    const data = loadStoredCityData(newCity);
    setRoutes(data.routes || []);
    setInterchangeHubs(data.hubs || []);
    setBusFleet(data.buses || []);
    setCrewMembers(data.drivers || []);
    setTrips(data.trips || (CITIES_DATA as any)[newCity]?.trips || []);
    refreshCityData(newCity);
    showToast(`Switched network to ${newCity.toUpperCase()}`);
  };

  // MASTER MUTATIONS CONNECTED TO BACKEND & LOCAL STATE
  const handleAddRoute = async (newRoute: any) => {
    const updatedRoutes = [...routes, newRoute];
    setRoutes(updatedRoutes);
    persistCurrentCityStore({ routes: updatedRoutes });
    await adminApi.createAdminRoute({
      ...newRoute,
      city: selectedCity,
      stops: newRoute.stops || [],
      coordinates: newRoute.pathCoordinates || newRoute.coordinates || []
    });
    showToast(`✓ ROUTE COMMITTED: Route ${newRoute.code} (${newRoute.name})`);
  };

  const handleScheduleTrip = async (newTrip: any) => {
    const updatedTrips = [newTrip, ...trips];
    setTrips(updatedTrips);
    persistCurrentCityStore({ trips: updatedTrips });
    await adminApi.scheduleAdminTrip({
      ...newTrip,
      city: selectedCity,
      routeId: newTrip.routeId || 'route-534',
      routeCode: newTrip.routeCode || '534',
      departureTime: newTrip.departureTime || '08:00 AM',
      arrivalTime: newTrip.arrivalTime || '09:15 AM',
      originHub: newTrip.originHub || 'Kashmere Gate ISBT',
      destHub: newTrip.destHub || 'Saket District Centre'
    });
    showToast(`✓ TRIP SCHEDULED: ${newTrip.id} on Route ${newTrip.routeCode || 'Active'}!`);
  };

  const handleAddVehicle = async (newVehicle: any) => {
    const updatedFleet = [...busFleet, newVehicle];
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    await adminApi.createAdminVehicle({ ...newVehicle, city: selectedCity });
    showToast(`✓ VEHICLE ADDED: ${newVehicle.busNumber || newVehicle.id}`);
  };

  const handleUpdateVehicle = async (updatedVehicle: any) => {
    const updatedFleet = busFleet.map(b => b.id === updatedVehicle.id ? { ...b, ...updatedVehicle } : b);
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    await adminApi.updateAdminVehicle(updatedVehicle.id, updatedVehicle);
    showToast(`✓ VEHICLE UPDATED: ${updatedVehicle.busNumber || updatedVehicle.id}`);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const updatedFleet = busFleet.filter(b => b.id !== vehicleId);
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    await adminApi.deleteAdminVehicle(vehicleId);
    showToast(`✓ VEHICLE RETIRED: ${vehicleId}`);
  };

  const handleScheduleMaintenance = async (vehicleId: string, maintenancePayload: any) => {
    const updatedFleet = busFleet.map(b => {
      if (b.id === vehicleId) {
        return {
          ...b,
          status: 'MAINTENANCE',
          nextServiceDate: maintenancePayload.scheduledDate || b.nextServiceDate
        };
      }
      return b;
    });
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    await adminApi.scheduleVehicleMaintenance(vehicleId, maintenancePayload);
    showToast(`✓ MAINTENANCE SCHEDULED: Asset ${vehicleId}`);
  };

  const handleUpdateVehicleAssignment = async (vehicleId: string, routeId: string, driverId: string, shiftTime: string) => {
    const updatedFleet = busFleet.map(b => {
      if (b.id === vehicleId) {
        return {
          ...b,
          assignedRoute: routeId,
          assignedDriver: driverId,
          status: 'IN_SERVICE'
        };
      }
      return b;
    });
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    await adminApi.assignVehicle(vehicleId, { vehicleId, routeId, driverId, shiftTime });
    showToast(`✓ ASSET DISPATCHED: ${vehicleId} assigned to Route ${routeId}`);
  };

  const handleAddDriver = async (newDriver: any) => {
    const updatedCrew = [...crewMembers, newDriver];
    setCrewMembers(updatedCrew);
    persistCurrentCityStore({ drivers: updatedCrew });
    await adminApi.createAdminDriver({ ...newDriver, city: selectedCity });
    showToast(`✓ CREW ONBOARDED: ${newDriver.fullName || newDriver.name}`);
  };

  const handleUpdateDriverDetails = async (driverId: string, updatedFields: any) => {
    const updatedCrew = crewMembers.map(c => c.id === driverId ? { ...c, ...updatedFields } : c);
    setCrewMembers(updatedCrew);
    persistCurrentCityStore({ drivers: updatedCrew });
    await adminApi.updateAdminDriver(driverId, updatedFields);
    showToast(`✓ DRIVER PROFILE UPDATED: ${driverId}`);
  };

  const handleDeactivateDriver = async (driverId: string) => {
    const updatedCrew = crewMembers.map(c => c.id === driverId ? { ...c, status: 'UNAVAILABLE' } : c);
    setCrewMembers(updatedCrew);
    persistCurrentCityStore({ drivers: updatedCrew });
    await adminApi.deactivateAdminDriver(driverId);
    showToast(`✓ DRIVER DEACTIVATED: ${driverId}`);
  };

  const handleUpdateDriverAssignment = async (routeId: string, busId: string, driverId: string, tripId: string) => {
    const targetDriver = crewMembers.find(c => c.id === driverId);
    const updatedBuses = busFleet.map(b => {
      if (b.id === busId) {
        return {
          ...b,
          driverId,
          assignedDriver: targetDriver?.fullName || targetDriver?.name || driverId,
          assignedRoute: routeId
        };
      }
      return b;
    });
    setBusFleet(updatedBuses);

    const updatedCrew = crewMembers.map(c => {
      if (c.id === driverId) {
        return {
          ...c,
          assignedBus: busId,
          assignedRoute: routeId,
          status: 'ASSIGNED'
        };
      }
      return c;
    });
    setCrewMembers(updatedCrew);

    persistCurrentCityStore({ buses: updatedBuses, drivers: updatedCrew });
    await adminApi.assignAdminDriver(driverId, { driverId, busId, routeId, tripId });
    showToast(`✓ CREW HANDOVER COMPLETED: Driver ${targetDriver?.name || driverId} assigned to Bus ${busId}!`);
  };

  const handleResolveConflictViaFallback = async (updatedDuty: any) => {
    const updatedDuties = dutyAssignments.map(d => d.id === updatedDuty.id ? updatedDuty : d);
    setDutyAssignments(updatedDuties);
    await adminApi.solveDutyConflicts(updatedDuty.id, "AUTO");
    showToast(`Conflict resolved successfully via Tier ${updatedDuty.resolvedViaTier || 1} Fallback! 100% rest compliance achieved.`);
  };

  // Conflict calculations
  const activeConflicts = detectAllConflicts(dutyAssignments, crewMembers, busFleet);
  const crewUtilization = calculateCrewUtilization(dutyAssignments, crewMembers);
  const networkCoverageKm = calculateNetworkCoverage(routes);
  const deadheadRatio = calculateDeadheadRatio(dutyAssignments);

  const toastAlerts = toastMessage ? [
    {
      id: 'toast-1',
      type: 'SUCCESS',
      title: 'Action Completed',
      message: toastMessage,
      actionLabel: 'DISMISS'
    }
  ] : [];

  return (
    <AdminLayout
      operationalTime={operationalTime}
      setOperationalTime={setOperationalTime}
      isSimulating={isSimulating}
      setIsSimulating={setIsSimulating}
      simSpeed={simSpeed}
      setSimSpeed={setSimSpeed}
      conflictsCount={activeConflicts.length}
      onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
      onOpenPRDModal={() => setIsPRDModalOpen(true)}
      darkMode={theme === 'dark'}
      setDarkMode={onToggleTheme}
      busFleet={busFleet}
      crewMembers={crewMembers}
      routes={routes}
      dutyAssignments={dutyAssignments}
      activeConflicts={activeConflicts}
      selectedCity={selectedCity}
      onSelectCity={handleSelectCity}
    >
      <Routes>
        {/* Module Selection Landing */}
        <Route
          path="/"
          element={
            <AdminModuleHome
              crewMembers={crewMembers}
              busFleet={busFleet}
              routes={routes}
              activeConflicts={activeConflicts}
            />
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <AdminDashboard
              busFleet={busFleet}
              crewMembers={crewMembers}
              routes={routes}
              dutyAssignments={dutyAssignments}
              activeConflicts={activeConflicts}
              crewUtilization={crewUtilization?.rate || 87.5}
              networkCoverageKm={networkCoverageKm}
              deadheadRatio={deadheadRatio}
              operationalTime={operationalTime}
              onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
            />
          }
        />

        {/* Drivers Module (Full 2268 lines from abhi) */}
        <Route
          path="/drivers/*"
          element={
            <DriversModule
              crewMembers={crewMembers}
              busFleet={busFleet}
              dutyAssignments={dutyAssignments}
              routes={routes}
              trips={trips}
              selectedCity={selectedCity}
              onAddDriver={handleAddDriver}
              onUpdateDriverDetails={handleUpdateDriverDetails}
              onDeactivateDriver={handleDeactivateDriver}
              onUpdateDriverAssignment={handleUpdateDriverAssignment}
              onUpdateBusAssignment={handleUpdateVehicleAssignment}
            />
          }
        />

        {/* Vehicles Module (Full 782 lines + 14 components from admin-route-engine) */}
        <Route
          path="/vehicles/*"
          element={
            <VehiclesModule
              busFleet={busFleet}
              dutyAssignments={dutyAssignments}
              routes={routes}
              crewMembers={crewMembers}
              trips={trips}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onUpdateVehicleAssignment={handleUpdateVehicleAssignment}
              onScheduleMaintenance={handleScheduleMaintenance}
            />
          }
        />

        {/* Routes Module (1018 lines) */}
        <Route
          path="/routes/*"
          element={
            <RoutesModule
              routes={routes}
              interchangeHubs={interchangeHubs}
              busFleet={busFleet}
              crewMembers={crewMembers}
              dutyAssignments={dutyAssignments}
              trips={trips}
              operationalTime={operationalTime}
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              hoveredRouteId={hoveredRouteId}
              setHoveredRouteId={setHoveredRouteId}
              selectedDutyId={selectedDutyId}
              setSelectedDutyId={setSelectedDutyId}
              onCommitNewRoute={handleAddRoute}
              isDrawingMode={isDrawingMode}
              setIsDrawingMode={setIsDrawingMode}
              drawnCoordinates={drawnPoints}
              setDrawnCoordinates={setDrawnPoints}
              overlapReport={null}
              setOverlapReport={() => {}}
              onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
              onScheduleTrip={handleScheduleTrip}
              onUpdateDriverAssignment={handleUpdateDriverAssignment}
              onUpdateBusAssignment={handleUpdateVehicleAssignment}
              onUpdateScheduleTime={() => showToast('Schedule timing updated.')}
              onCancelTrip={(tripId: string) => {
                const updated = trips.filter((t: any) => t.id !== tripId);
                setTrips(updated);
                persistCurrentCityStore({ trips: updated });
                showToast(`Trip ${tripId} cancelled.`);
              }}
              onDeactivateRoute={(routeId: string) => {
                const updated = routes.filter((r: any) => r.id !== routeId);
                setRoutes(updated);
                persistCurrentCityStore({ routes: updated });
                showToast(`Route ${routeId} deactivated.`);
              }}
              onAddDriver={handleAddDriver}
              onDeactivateDriver={handleDeactivateDriver}
              selectedCity={selectedCity}
            />
          }
        />

        {/* Management Module (167 lines) */}
        <Route
          path="/management/*"
          element={
            <ManagementModule
              dutyAssignments={dutyAssignments}
              crewMembers={crewMembers}
              busFleet={busFleet}
              routes={routes}
              operationalTime={operationalTime}
              selectedDutyId={selectedDutyId}
              setSelectedDutyId={setSelectedDutyId}
              hoveredRouteId={hoveredRouteId}
              setHoveredRouteId={setHoveredRouteId}
              activeConflicts={activeConflicts}
              onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
            />
          }
        />

        {/* Direct Admin Pages */}
        <Route path="/fleet" element={<AdminFleet busFleet={busFleet} dutyAssignments={dutyAssignments} routes={routes} />} />
        <Route
          path="/scheduling"
          element={
            <AdminScheduling
              dutyAssignments={dutyAssignments}
              crewMembers={crewMembers}
              busFleet={busFleet}
              routes={routes}
              operationalTime={operationalTime}
              selectedDutyId={selectedDutyId}
              setSelectedDutyId={setSelectedDutyId}
              hoveredRouteId={hoveredRouteId}
              setHoveredRouteId={setHoveredRouteId}
              onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
            />
          }
        />
        <Route
          path="/operations"
          element={
            <AdminOperations
              routes={routes}
              interchangeHubs={interchangeHubs}
              busFleet={busFleet}
              crewMembers={crewMembers}
              dutyAssignments={dutyAssignments}
              operationalTime={operationalTime}
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              hoveredRouteId={hoveredRouteId}
              setHoveredRouteId={setHoveredRouteId}
              selectedDutyId={selectedDutyId}
              setSelectedDutyId={setSelectedDutyId}
              onCommitNewRoute={handleAddRoute}
              onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
              isDrawingMode={isDrawingMode}
              setIsDrawingMode={setIsDrawingMode}
              drawnCoordinates={drawnPoints}
              setDrawnCoordinates={setDrawnPoints}
              overlapReport={null}
              setOverlapReport={() => {}}
            />
          }
        />
        <Route path="/analytics" element={<AdminAnalytics routes={routes} busFleet={busFleet} crewMembers={crewMembers} />} />
        <Route path="/alerts" element={<AdminAlerts activeConflicts={activeConflicts} onOpenFallbackModal={() => setIsFallbackModalOpen(true)} />} />
        <Route path="/settings" element={<AdminSettings />} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>

      {/* 3-Tier Rest Fallback Solver Modal */}
      <FallbackSolverModal
        isOpen={isFallbackModalOpen}
        onClose={() => setIsFallbackModalOpen(false)}
        dutyAssignments={dutyAssignments}
        crewMembers={crewMembers}
        busFleet={busFleet}
        interchangeHubs={interchangeHubs}
        onApplyResolution={handleResolveConflictViaFallback}
      />

      {/* PRD & Spec Modal */}
      <PRDModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
      />

      {/* Toast Container */}
      <AlertToastContainer
        alerts={toastAlerts}
        onDismissAlert={() => setToastMessage(null)}
        onResolveAlertAction={() => setToastMessage(null)}
      />
    </AdminLayout>
  );
};

// ----------------------------------------------------
// MAIN APP ROUTER CONTAINER
// ----------------------------------------------------
export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC PASSENGER LANDING ROUTE (Preserved 100%) */}
        <Route
          path="/"
          element={<LandingPageComponent theme={theme} onToggleTheme={handleToggleTheme} />}
        />

        {/* DRIVER PORTAL ROUTE (Preserved 100%) */}
        <Route
          path="/driver"
          element={<DriverPortalWrapper theme={theme} onToggleTheme={handleToggleTheme} />}
        />

        {/* ADMIN 4-MODULE CONTROL CENTER (Merged & Backend-Linked) */}
        <Route
          path="/admin/*"
          element={<AdminControlCenter theme={theme} onToggleTheme={handleToggleTheme} />}
        />

        {/* Direct /vehicles/fleet URLs routing to Admin Vehicles module */}
        <Route path="/vehicles/fleet/active" element={<Navigate to="/admin/vehicles/fleet/active" replace />} />
        <Route path="/vehicles/fleet/inactive" element={<Navigate to="/admin/vehicles/fleet/inactive" replace />} />
        <Route path="/vehicles/fleet/maintenance" element={<Navigate to="/admin/vehicles/fleet/maintenance" replace />} />
        <Route path="/vehicles/fleet" element={<Navigate to="/admin/vehicles/fleet" replace />} />
        <Route path="/vehicles/*" element={<Navigate to="/admin/vehicles/fleet" replace />} />

        {/* Direct /management URLs routing to Admin Management module */}
        <Route path="/management/scheduling" element={<Navigate to="/admin/management/scheduling" replace />} />
        <Route path="/management/smartassignment" element={<Navigate to="/admin/management/smartassignment" replace />} />
        <Route path="/management/rotation" element={<Navigate to="/admin/management/rotation" replace />} />
        <Route path="/management/longjourney" element={<Navigate to="/admin/management/longjourney" replace />} />
        <Route path="/management/alerts" element={<Navigate to="/admin/management/alerts" replace />} />
        <Route path="/management/network" element={<Navigate to="/admin/management/network" replace />} />
        <Route path="/management/*" element={<Navigate to="/admin/management" replace />} />

        {/* Fallback to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

