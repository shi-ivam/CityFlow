import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Original Components (Reused for '/' public view)
import Navbar from './components/Navbar';
import MetricsBanner from './components/MetricsBanner';
import DualViewDashboard from './components/DualViewDashboard';
import RouteMap from './components/RouteMap';
import GanttTimeline from './components/GanttTimeline';
import SummaryAnalyticsView from './components/SummaryAnalyticsView';
import FallbackSolverModal from './components/FallbackSolverModal';
import PRDModal from './components/PRDModal';

// Redesigned Admin Progressive Disclosure Architecture
import AdminLayout from './components/admin/AdminLayout';
import AdminModuleHome from './pages/admin/AdminModuleHome';
import DriversModule from './pages/admin/modules/DriversModule';
import VehiclesModule from './pages/admin/modules/VehiclesModule';
import RoutesModule from './pages/admin/modules/RoutesModule';
import ManagementModule from './pages/admin/modules/ManagementModule';

import { 
  CITIES_DATA,
  INITIAL_ROUTES, 
  INTERCHANGE_HUBS, 
  BUS_FLEET, 
  CREW_MEMBERS, 
  INITIAL_DUTIES 
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
import { Radio, ExternalLink } from 'lucide-react';

// Centralized LocalStorage Storage Key Helpers
const STORAGE_KEYS = {
  CITY: 'cityflow_selected_city',
  DELHI: 'cityflow_store_delhi',
  CHENNAI: 'cityflow_store_chennai'
};

function loadStoredCityData(cityName) {
  try {
    const key = cityName === 'chennai' ? STORAGE_KEYS.CHENNAI : STORAGE_KEYS.DELHI;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to load local storage data", e);
  }
  return CITIES_DATA[cityName] || CITIES_DATA.delhi;
}

function saveCityDataToStore(cityName, data) {
  try {
    const key = cityName === 'chennai' ? STORAGE_KEYS.CHENNAI : STORAGE_KEYS.DELHI;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to local storage", e);
  }
}

function AppContent() {
  // Multi-City Selected State with LocalStorage Persistence
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CITY) || 'delhi';
  });

  // Master Operations State loaded from Central Store
  const initialCityStore = loadStoredCityData(selectedCity);

  const [routes, setRoutes] = useState(initialCityStore.routes);
  const [interchangeHubs, setInterchangeHubs] = useState(initialCityStore.hubs);
  const [busFleet, setBusFleet] = useState(initialCityStore.buses);
  const [crewMembers, setCrewMembers] = useState(initialCityStore.drivers);
  const [trips, setTrips] = useState(initialCityStore.trips || CITIES_DATA[selectedCity]?.trips || []);
  const [dutyAssignments, setDutyAssignments] = useState(INITIAL_DUTIES);

  // Synchronize with LocalStorage on city change
  const handleSelectCity = (newCity) => {
    setSelectedCity(newCity);
    localStorage.setItem(STORAGE_KEYS.CITY, newCity);
    const data = loadStoredCityData(newCity);
    setRoutes(data.routes);
    setInterchangeHubs(data.hubs);
    setBusFleet(data.buses);
    setCrewMembers(data.drivers);
    setTrips(data.trips || CITIES_DATA[newCity]?.trips || []);
  };

  // Helper to persist current operational state
  const persistCurrentCityStore = (updatedFields) => {
    const newStore = {
      routes: updatedFields.routes || routes,
      hubs: updatedFields.hubs || interchangeHubs,
      buses: updatedFields.buses || busFleet,
      drivers: updatedFields.drivers || crewMembers,
      trips: updatedFields.trips || trips
    };
    saveCityDataToStore(selectedCity, newStore);
  };

  // MASTER MUTATION: Schedule New Trip
  const handleScheduleTrip = (newTrip) => {
    const updatedTrips = [newTrip, ...trips];
    setTrips(updatedTrips);
    persistCurrentCityStore({ trips: updatedTrips });
    showToast(`✓ TRIP SCHEDULED: ${newTrip.id} on Route ${newTrip.routeCode}!`);
  };

  // MASTER MUTATION: Update Driver Assignment Across All Dependent Entities
  const handleUpdateDriverAssignment = (routeId, busId, driverId, tripId) => {
    const targetDriver = crewMembers.find(c => c.id === driverId);
    if (!targetDriver) return;

    // Update Crew Roster
    const updatedCrew = crewMembers.map(c => {
      if (c.id === driverId) return { ...c, status: 'ASSIGNED', assignedRouteId: routeId };
      return c;
    });
    setCrewMembers(updatedCrew);

    // Update Trips
    const updatedTrips = trips.map(t => {
      if (t.id === tripId || (t.routeId === routeId && t.status === 'RUNNING')) {
        return { ...t, driverId: driverId, driverName: targetDriver.name || targetDriver.fullName };
      }
      return t;
    });
    setTrips(updatedTrips);

    persistCurrentCityStore({ drivers: updatedCrew, trips: updatedTrips });
    showToast(`✓ DRIVER CHANGED: ${targetDriver.name || targetDriver.fullName} assigned to Trip!`);
  };

  // MASTER MUTATION: Update Bus Assignment Across All Dependent Entities
  const handleUpdateBusAssignment = (routeId, oldBusId, newBusId, tripId) => {
    const newBus = busFleet.find(b => b.id === newBusId);
    if (!newBus) return;

    const updatedBuses = busFleet.map(b => {
      if (b.id === newBusId) return { ...b, status: 'IN_SERVICE', assignedRoute: routeId };
      if (b.id === oldBusId) return { ...b, status: 'STANDBY_READY', assignedRoute: null };
      return b;
    });
    setBusFleet(updatedBuses);

    const updatedTrips = trips.map(t => {
      if (t.id === tripId || (t.routeId === routeId && t.status === 'RUNNING')) {
        return { ...t, busId: newBusId, busNumber: newBus.busNumber };
      }
      return t;
    });
    setTrips(updatedTrips);

    persistCurrentCityStore({ buses: updatedBuses, trips: updatedTrips });
    showToast(`✓ BUS REPLACED: ${newBus.busNumber} assigned to Trip!`);
  };

  // MASTER MUTATION: Update Schedule Departure Time
  const handleUpdateScheduleTime = (dutyId, newTimeStr) => {
    const updatedDuties = dutyAssignments.map(d => {
      if (d.id === dutyId || d.dutyCode === dutyId) {
        return { ...d, startTimeStr: newTimeStr };
      }
      return d;
    });
    setDutyAssignments(updatedDuties);

    const updatedTrips = trips.map(t => {
      if (t.id === dutyId) return { ...t, departureTime: newTimeStr };
      return t;
    });
    setTrips(updatedTrips);

    persistCurrentCityStore({ trips: updatedTrips });
    showToast(`✓ SCHEDULE UPDATED: Departure time updated to ${newTimeStr}`);
  };

  // MASTER MUTATION: Cancel Trip
  const handleCancelTrip = (tripId, busId) => {
    const updatedTrips = trips.map(t => {
      if (t.id === tripId) {
        return { ...t, status: 'CANCELLED' };
      }
      return t;
    });
    setTrips(updatedTrips);

    persistCurrentCityStore({ trips: updatedTrips });
    showToast(`✓ TRIP CANCELLED: ${tripId} status set to CANCELLED.`);
  };

  // MASTER MUTATION: Add New Route
  const handleAddRoute = (newRoute) => {
    const updatedRoutes = [...routes, newRoute];
    setRoutes(updatedRoutes);
    persistCurrentCityStore({ routes: updatedRoutes });
    showToast(`✓ ROUTE CREATED: Route ${newRoute.code} added to ${selectedCity.toUpperCase()} network!`);
  };

  // MASTER MUTATION: Deactivate Route
  const handleDeactivateRoute = (routeId) => {
    const updatedRoutes = routes.map(r => {
      if (r.id === routeId || r.code === routeId) {
        return { ...r, status: r.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE' };
      }
      return r;
    });
    setRoutes(updatedRoutes);
    persistCurrentCityStore({ routes: updatedRoutes });
    showToast(`✓ ROUTE STATUS UPDATED: Status toggled successfully.`);
  };

  // MASTER MUTATION: Add New Driver
  const handleAddDriver = (newDriver) => {
    const updatedCrew = [...crewMembers, newDriver];
    setCrewMembers(updatedCrew);
    persistCurrentCityStore({ drivers: updatedCrew });
    showToast(`✓ DRIVER ADDED: ${newDriver.name} added to roster!`);
  };

  // MASTER MUTATION: Deactivate Driver
  const handleDeactivateDriver = (driverId) => {
    const updatedCrew = crewMembers.map(c => {
      if (c.id === driverId) {
        return { ...c, status: c.status === 'INACTIVE' ? 'STANDBY_READY' : 'INACTIVE' };
      }
      return c;
    });
    setCrewMembers(updatedCrew);
    persistCurrentCityStore({ drivers: updatedCrew });
    showToast(`✓ DRIVER STATUS UPDATED: Status toggled.`);
  };

  // MASTER MUTATION: Add New Vehicle
  const handleAddVehicle = (newVehicle) => {
    const updatedFleet = [...busFleet, newVehicle];
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    showToast(`✓ VEHICLE REGISTERED: ${newVehicle.busNumber} added to fleet!`);
  };

  // MASTER MUTATION: Update Vehicle
  const handleUpdateVehicle = (updatedVehicle) => {
    const updatedFleet = busFleet.map(b => b.id === updatedVehicle.id ? { ...b, ...updatedVehicle } : b);
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    showToast(`✓ VEHICLE UPDATED: ${updatedVehicle.busNumber} parameters saved.`);
  };

  // MASTER MUTATION: Delete / Decommission Vehicle
  const handleDeleteVehicle = (vehicleId) => {
    const updatedFleet = busFleet.filter(b => b.id !== vehicleId);
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    showToast(`✓ VEHICLE DECOMMISSIONED.`);
  };

  // MASTER MUTATION: Vehicle Assignment
  const handleUpdateVehicleAssignment = (assignmentData) => {
    const { vehicleId, assignedRoute, driverId, assignedDriver, depot } = assignmentData;
    const updatedFleet = busFleet.map(b => {
      if (b.id === vehicleId) {
        return {
          ...b,
          assignedRoute,
          driverId,
          assignedDriver,
          depot: depot || b.depot,
          status: 'IN_SERVICE'
        };
      }
      return b;
    });
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    showToast(`✓ ASSIGNMENT UPDATED: Asset ${vehicleId} paired with Route ${assignedRoute}.`);
  };

  // MASTER MUTATION: Schedule Maintenance
  const handleScheduleMaintenance = (maintenanceData) => {
    const { vehicleId } = maintenanceData;
    const updatedFleet = busFleet.map(b => {
      if (b.id === vehicleId) {
        return {
          ...b,
          status: 'MAINTENANCE',
          maintenanceStatus: 'UNDER_REPAIR',
          nextServiceDate: maintenanceData.estCompletion || b.nextServiceDate
        };
      }
      return b;
    });
    setBusFleet(updatedFleet);
    persistCurrentCityStore({ buses: updatedFleet });
    showToast(`✓ WORK ORDER ISSUED: Asset ${vehicleId} flagged for workshop inspection.`);
  };

  // Time & Simulation Scrubber
  const [operationalTime, setOperationalTime] = useState(480);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // Public View Active Tab
  const [activeTab, setActiveTab] = useState('dual-view');

  // Synchronized Selection & Hover States
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [selectedDutyId, setSelectedDutyId] = useState(null);

  // Route Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState([]);
  const [overlapReport, setOverlapReport] = useState(null);

  // Modals & Drawers
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState(false);
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clock Simulation Timer
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setOperationalTime(prev => {
        const next = prev + simSpeed;
        return next >= 1440 ? 300 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Derived Operational Metrics
  const crewUtilization = calculateCrewUtilization(crewMembers, dutyAssignments);
  const networkCoverageKm = calculateNetworkCoverage(routes);
  const deadheadRatio = calculateDeadheadRatio(dutyAssignments);
  const activeConflicts = detectAllConflicts(dutyAssignments, crewMembers, busFleet);

  const activeBusesCount = busFleet.filter(b => b.status === 'IN_SERVICE').length;
  const totalBusesCount = busFleet.length;

  const linkedDutiesCount = dutyAssignments.filter(d => d.dutyType === 'LINKED').length;
  const unlinkedDutiesCount = dutyAssignments.filter(d => d.dutyType === 'UNLINKED').length;

  // Apply Fallback Resolution
  const handleApplyResolution = (updatedDuty) => {
    setDutyAssignments(prev => prev.map(d => d.id === updatedDuty.id ? updatedDuty : d));

    if (updatedDuty.crewId) {
      setCrewMembers(prev => prev.map(c => {
        if (c.id === updatedDuty.crewId) {
          return { ...c, status: 'ASSIGNED', isStandby: false };
        }
        if (c.id === 'DRV-1043') {
          return { ...c, status: 'RESTING_COMPLIANT' };
        }
        return c;
      }));
    }

    showToast(`Conflict resolved successfully via Tier ${updatedDuty.resolvedViaTier} Fallback! 100% rest compliance achieved.`);
  };

  return (
    <>
      <Routes>
        {/* PUBLIC / PASSENGER LANDING ROUTE */}
        <Route
          path="/"
          element={
            <div className={`h-screen w-screen bg-[#050811] text-slate-100 flex flex-col font-sans select-none overflow-hidden ${darkMode ? 'dark' : ''}`}>
              
              <div className="bg-primary px-4 py-1.5 text-xs text-primary-foreground flex items-center justify-between font-sans shrink-0">
                <div className="flex items-center space-x-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span className="font-semibold">{selectedCity.toUpperCase()} Transport Operations Center</span>
                  <span className="hidden sm:inline opacity-80">— Launch 4-Module Admin Control Center</span>
                </div>
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-card text-foreground px-2.5 py-0.5 rounded text-[11px] font-bold font-mono hover:bg-accent transition-colors flex items-center space-x-1"
                >
                  <span>Launch Admin</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                operationalTime={operationalTime}
                setOperationalTime={setOperationalTime}
                isSimulating={isSimulating}
                setIsSimulating={setIsSimulating}
                simSpeed={simSpeed}
                setSimSpeed={setSimSpeed}
                conflictsCount={activeConflicts.length}
                onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
                onOpenPRDModal={() => setIsPRDModalOpen(true)}
              />

              <MetricsBanner
                crewUtilization={crewUtilization}
                networkCoverageKm={networkCoverageKm}
                deadheadRatio={deadheadRatio}
                overlapStats={overlapReport}
                activeBusesCount={activeBusesCount}
                totalBusesCount={totalBusesCount}
                linkedDutiesCount={linkedDutiesCount}
                unlinkedDutiesCount={unlinkedDutiesCount}
                conflictsCount={activeConflicts.length}
                onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
              />

              <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
                {activeTab === 'dual-view' && (
                  <DualViewDashboard
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
                    drawnCoordinates={drawnCoordinates}
                    setDrawnCoordinates={setDrawnCoordinates}
                    overlapReport={overlapReport}
                    setOverlapReport={setOverlapReport}
                  />
                )}

                {activeTab === 'routes-gis' && (
                  <div className="flex-1 relative flex flex-col h-full w-full min-h-0">
                    <RouteMap
                      routes={routes}
                      interchangeHubs={interchangeHubs}
                      busFleet={busFleet}
                      dutyAssignments={dutyAssignments}
                      operationalTime={operationalTime}
                      selectedRouteId={selectedRouteId}
                      onSelectRoute={setSelectedRouteId}
                      hoveredRouteId={hoveredRouteId}
                      onHoverRoute={setHoveredRouteId}
                      onCommitNewRoute={handleAddRoute}
                      isDrawingMode={isDrawingMode}
                      setIsDrawingMode={setIsDrawingMode}
                      drawnCoordinates={drawnCoordinates}
                      setDrawnCoordinates={setDrawnCoordinates}
                      overlapReport={overlapReport}
                      setOverlapReport={setOverlapReport}
                      selectedCity={selectedCity}
                    />
                  </div>
                )}

                {activeTab === 'schedule-gantt' && (
                  <div className="flex-1 relative flex flex-col h-full w-full min-h-0">
                    <GanttTimeline
                      dutyAssignments={dutyAssignments}
                      crewMembers={crewMembers}
                      busFleet={busFleet}
                      routes={routes}
                      operationalTime={operationalTime}
                      selectedDutyId={selectedDutyId}
                      onSelectDuty={setSelectedDutyId}
                      hoveredRouteId={hoveredRouteId}
                      onHoverRoute={setHoveredRouteId}
                      onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
                    />
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <SummaryAnalyticsView
                    routes={routes}
                    crewMembers={crewMembers}
                    dutyAssignments={dutyAssignments}
                    busFleet={busFleet}
                    interchangeHubs={interchangeHubs}
                  />
                )}
              </main>
            </div>
          }
        />

        {/* ADMIN 4-MODULE PROGRESSIVE DISCLOSURE CONTROL CENTER */}
        <Route
          path="/admin/*"
          element={
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
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              busFleet={busFleet}
              crewMembers={crewMembers}
              routes={routes}
              dutyAssignments={dutyAssignments}
              activeConflicts={activeConflicts}
              selectedCity={selectedCity}
              onSelectCity={handleSelectCity}
            >
              <Routes>
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

                <Route
                  path="/drivers/*"
                  element={
                    <DriversModule
                      crewMembers={crewMembers}
                      dutyAssignments={dutyAssignments}
                      routes={routes}
                      onAddDriver={handleAddDriver}
                      onDeactivateDriver={handleDeactivateDriver}
                    />
                  }
                />

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
                      onCommitNewRoute={handleAddRoute}
                      isDrawingMode={isDrawingMode}
                      setIsDrawingMode={setIsDrawingMode}
                      drawnCoordinates={drawnCoordinates}
                      setDrawnCoordinates={setDrawnCoordinates}
                      overlapReport={overlapReport}
                      setOverlapReport={setOverlapReport}
                      selectedCity={selectedCity}
                      onScheduleTrip={handleScheduleTrip}
                      onUpdateDriverAssignment={handleUpdateDriverAssignment}
                      onUpdateBusAssignment={handleUpdateBusAssignment}
                      onUpdateScheduleTime={handleUpdateScheduleTime}
                      onCancelTrip={handleCancelTrip}
                      onDeactivateRoute={handleDeactivateRoute}
                      onAddDriver={handleAddDriver}
                      onDeactivateDriver={handleDeactivateDriver}
                    />
                  }
                />

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
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>

      {/* Shared Modals */}
      <FallbackSolverModal
        isOpen={isFallbackModalOpen}
        onClose={() => setIsFallbackModalOpen(false)}
        dutyAssignments={dutyAssignments}
        crewMembers={crewMembers}
        busFleet={busFleet}
        interchangeHubs={interchangeHubs}
        onApplyResolution={handleApplyResolution}
      />

      <PRDModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[3500] bg-popover border border-primary/50 text-popover-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 font-mono text-xs animate-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
