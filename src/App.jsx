import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Auth & Permissions
import { AuthProvider, useAuth, ROLES } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary';

// Central Relational Database Engine
import { db, SUPPORTED_CITIES } from './db/transitDb.js';

// Original Components (Reused for '/' public view)
import Navbar from './components/Navbar';
import MetricsBanner from './components/MetricsBanner';
import DualViewDashboard from './components/DualViewDashboard';
import RouteMap from './components/RouteMap';
import GanttTimeline from './components/GanttTimeline';
import SummaryAnalyticsView from './components/SummaryAnalyticsView';
import FallbackSolverModal from './components/FallbackSolverModal';
import PRDModal from './components/PRDModal';

// Dedicated Admin Modules & Redesigned Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagementModule from './pages/admin/modules/ManagementModule';
import RoutesModule from './pages/admin/modules/RoutesModule';
import AdminScheduling from './pages/admin/AdminScheduling';
import AdminAssignment from './pages/admin/AdminAssignment';
import AdminRotation from './pages/admin/AdminRotation';
import AdminLongJourney from './pages/admin/AdminLongJourney';
import AdminConflicts from './pages/admin/AdminConflicts';
import AdminNetwork from './pages/admin/AdminNetwork';
import AdminPerformance from './pages/admin/AdminPerformance';
import AdminReports from './pages/admin/AdminReports';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminSettings from './pages/admin/AdminSettings';
import AdminFleet from './pages/admin/AdminFleet';
import AdminDrivers from './pages/admin/AdminDrivers';

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

const STORAGE_KEYS = {
  CITY: 'cityflow_selected_city'
};

function AppContent() {
  // Multi-City Selected State with LocalStorage Persistence
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.CITY) || 'delhi';
  });

  // Master Operations State loaded from Central Transit Database
  const [routes, setRoutes] = useState(() => db.getCollection(selectedCity, 'routes'));
  const [interchangeHubs, setInterchangeHubs] = useState(() => db.getCollection(selectedCity, 'hubs'));
  const [busFleet, setBusFleet] = useState(() => db.getCollection(selectedCity, 'buses'));
  const [crewMembers, setCrewMembers] = useState(() => db.getCollection(selectedCity, 'drivers'));
  const [trips, setTrips] = useState(() => db.getCollection(selectedCity, 'trips'));
  const [dutyAssignments, setDutyAssignments] = useState(() => db.getCollection(selectedCity, 'duties'));

  // Synchronize on city change
  const handleSelectCity = (newCity) => {
    setSelectedCity(newCity);
    localStorage.setItem(STORAGE_KEYS.CITY, newCity);
    setRoutes(db.getCollection(newCity, 'routes'));
    setInterchangeHubs(db.getCollection(newCity, 'hubs'));
    setBusFleet(db.getCollection(newCity, 'buses'));
    setCrewMembers(db.getCollection(newCity, 'drivers'));
    setTrips(db.getCollection(newCity, 'trips'));
    setDutyAssignments(db.getCollection(newCity, 'duties'));
  };

  // Helper to persist current operational state
  const persistCurrentCityStore = (updatedFields) => {
    if (updatedFields.routes) db.saveCollection(selectedCity, 'routes', updatedFields.routes);
    if (updatedFields.hubs) db.saveCollection(selectedCity, 'hubs', updatedFields.hubs);
    if (updatedFields.buses) db.saveCollection(selectedCity, 'buses', updatedFields.buses);
    if (updatedFields.drivers) db.saveCollection(selectedCity, 'drivers', updatedFields.drivers);
    if (updatedFields.trips) db.saveCollection(selectedCity, 'trips', updatedFields.trips);
    if (updatedFields.duties) db.saveCollection(selectedCity, 'duties', updatedFields.duties);
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

        {/* LOGIN ROUTE */}
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN CONTROL CENTER WITH RBAC PROTECTED ROUTE */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
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
                  <Route path="/" element={<Navigate to="/admin/management" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <AdminDashboard
                        busFleet={busFleet}
                        crewMembers={crewMembers}
                        routes={routes}
                        dutyAssignments={dutyAssignments}
                        activeConflicts={activeConflicts}
                        operationalTime={operationalTime}
                        onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
                      />
                    }
                  />

                  <Route
                    path="/management/*"
                    element={
                      <ManagementModule
                        dutyAssignments={dutyAssignments}
                        setDutyAssignments={setDutyAssignments}
                        crewMembers={crewMembers}
                        setCrewMembers={setCrewMembers}
                        busFleet={busFleet}
                        setBusFleet={setBusFleet}
                        routes={routes}
                        trips={trips}
                        setTrips={setTrips}
                        operationalTime={operationalTime}
                        selectedDutyId={selectedDutyId}
                        setSelectedDutyId={setSelectedDutyId}
                        hoveredRouteId={hoveredRouteId}
                        setHoveredRouteId={setHoveredRouteId}
                        activeConflicts={activeConflicts}
                        onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
                        selectedCity={selectedCity}
                        onScheduleTrip={handleScheduleTrip}
                        onUpdateDriverAssignment={handleUpdateDriverAssignment}
                        onUpdateBusAssignment={handleUpdateBusAssignment}
                        onUpdateScheduleTime={handleUpdateScheduleTime}
                        onCancelTrip={handleCancelTrip}
                      />
                    }
                  />

                  <Route
                    path="/scheduling/*"
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
                    path="/assignment/*"
                    element={
                      <AdminAssignment
                        routes={routes}
                        crewMembers={crewMembers}
                        busFleet={busFleet}
                        dutyAssignments={dutyAssignments}
                        onUpdateDriverAssignment={handleUpdateDriverAssignment}
                        onUpdateBusAssignment={handleUpdateBusAssignment}
                        selectedCity={selectedCity}
                      />
                    }
                  />

                  <Route
                    path="/rotation/*"
                    element={
                      <AdminRotation
                        crewMembers={crewMembers}
                        onUpdateDriverAssignment={handleUpdateDriverAssignment}
                        selectedCity={selectedCity}
                      />
                    }
                  />

                  <Route
                    path="/longjourney/*"
                    element={
                      <AdminLongJourney
                        crewMembers={crewMembers}
                        busFleet={busFleet}
                        selectedCity={selectedCity}
                      />
                    }
                  />

                  <Route
                    path="/fleet/*"
                    element={
                      <AdminFleet
                        busFleet={busFleet}
                        dutyAssignments={dutyAssignments}
                        routes={routes}
                        selectedCity={selectedCity}
                        onUpdateBus={handleUpdateBusAssignment}
                      />
                    }
                  />

                  <Route
                    path="/vehicles/*"
                    element={
                      <AdminFleet
                        busFleet={busFleet}
                        dutyAssignments={dutyAssignments}
                        routes={routes}
                        selectedCity={selectedCity}
                        onUpdateBus={handleUpdateBusAssignment}
                      />
                    }
                  />

                  <Route
                    path="/drivers/*"
                    element={
                      <AdminDrivers
                        crewMembers={crewMembers}
                        dutyAssignments={dutyAssignments}
                        routes={routes}
                        selectedCity={selectedCity}
                        onUpdateDriver={handleUpdateDriverAssignment}
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
                    path="/alerts/*"
                    element={
                      <AdminAlerts
                        activeConflicts={activeConflicts}
                        dutyAssignments={dutyAssignments}
                        crewMembers={crewMembers}
                        onOpenFallbackModal={() => setIsFallbackModalOpen(true)}
                      />
                    }
                  />

                  <Route
                    path="/conflicts/*"
                    element={
                      <AdminConflicts
                        selectedCity={selectedCity}
                        onConflictResolved={handleApplyResolution}
                      />
                    }
                  />

                  <Route path="/network/*" element={<AdminNetwork selectedCity={selectedCity} />} />
                  <Route path="/network-status/*" element={<AdminNetwork selectedCity={selectedCity} />} />
                  <Route path="/performance/*" element={<AdminPerformance selectedCity={selectedCity} />} />
                  <Route path="/reports/*" element={<AdminReports selectedCity={selectedCity} />} />
                  <Route path="/activity/*" element={<AdminActivityLog selectedCity={selectedCity} />} />
                  <Route path="/settings/*" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
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
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
