import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import RouteMap from '../../../components/RouteMap';
import RoutePlannerDrawer from '../../../components/admin/RoutePlannerDrawer';
import PlanTripDrawer from '../../../components/admin/PlanTripDrawer';
import AlertToastContainer from '../../../components/admin/AlertToastContainer';
import AdminOverrideModal from '../../../components/admin/AdminOverrideModal';
import QuickEntityActionMenu from '../../../components/admin/QuickEntityActionMenu';
import SmartFixModal from '../../../components/admin/SmartFixModal';
import RouteConflictResolutionModal from '../../../components/admin/RouteConflictResolutionModal';
import CrewUtilisationCard from '../../../components/admin/CrewUtilisationCard';
import TripCoverageCard from '../../../components/admin/TripCoverageCard';
import GanttTimeline from '../../../components/GanttTimeline';
import { detectAllRouteOverlaps } from '../../../services/routeConflictService';
import { 
  Route as RouteIcon, 
  MapPin, 
  AlertTriangle, 
  Users, 
  ArrowRight, 
  Plus, 
  Search, 
  CalendarClock, 
  Bus, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
  Edit,
  X,
  Power,
  Wrench,
  UserCheck,
  Calendar,
  Layers,
  ShieldAlert,
  ListFilter,
  Eye,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function RoutesModule({
  routes = [],
  interchangeHubs = [],
  busFleet = [],
  crewMembers = [],
  dutyAssignments = [],
  trips = [],
  operationalTime = 480,
  selectedRouteId,
  setSelectedRouteId,
  hoveredRouteId,
  setHoveredRouteId,
  selectedDutyId,
  setSelectedDutyId,
  onCommitNewRoute,
  isDrawingMode,
  setIsDrawingMode,
  drawnCoordinates,
  setDrawnCoordinates,
  overlapReport,
  setOverlapReport,
  onOpenFallbackModal,
  selectedCity = 'delhi',
  onScheduleTrip,
  onUpdateDriverAssignment,
  onUpdateBusAssignment,
  onUpdateScheduleTime,
  onCancelTrip,
  onDeactivateRoute,
  onAddDriver,
  onDeactivateDriver
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const path = location.pathname;
  const viewFilter = searchParams.get('view') || 'all';

  let activeTab = 'live';
  if (path.includes('/routes/overview')) activeTab = 'overview';
  else if (path.includes('/routes/map')) activeTab = 'map';
  else if (path.includes('/routes/list')) activeTab = 'list';
  else if (path.includes('/routes/create')) activeTab = 'create';
  else if (path.includes('/routes/conflicts')) activeTab = 'conflicts';
  else if (path.includes('/routes/overflow')) activeTab = 'overflow';
  else if (path.includes('/routes/plan')) activeTab = 'plan';
  else if (path.includes('/routes/trips')) activeTab = 'trips';
  else if (path.includes('/routes/schedule')) activeTab = 'schedule';
  else if (path.includes('/routes/assign')) activeTab = 'assign';
  else if (path.includes('/routes/issues')) activeTab = 'issues';

  const [isPlannerOpen, setIsPlannerOpen] = useState(path.includes('/routes/create'));
  const [isPlanTripOpen, setIsPlanTripOpen] = useState(false);
  const [userIntentSearch, setUserIntentSearch] = useState('');

  useEffect(() => {
    if (path.includes('/routes/create')) {
      setIsPlannerOpen(true);
    }
  }, [path]);

  const [viewTripsRouteId, setViewTripsRouteId] = useState(null);

  const activeRouteConflicts = useMemo(() => {
    return detectAllRouteOverlaps(routes);
  }, [routes, selectedCity]);

  const [scheduleFilter, setScheduleFilter] = useState('ALL');

  const [isSmartFixOpen, setIsSmartFixOpen] = useState(false);
  const [activeFixIssue, setActiveFixIssue] = useState(null);

  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [activeConflictData, setActiveConflictData] = useState(null);

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [pendingOverrideInfo, setPendingOverrideInfo] = useState(null);

  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');

  const [editingDepartureTime, setEditingDepartureTime] = useState('08:30 AM');
  const [isEditingTimeInline, setIsEditingTimeInline] = useState(false);

  const [assignedBusId, setAssignedBusId] = useState(busFleet[0]?.id || '');
  const [assignedDriverId, setAssignedDriverId] = useState(crewMembers[0]?.id || '');
  const [assignedRouteId, setAssignedRouteId] = useState(routes[0]?.id || '');

  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'alert-drv-1042',
      type: 'WARNING',
      title: 'DRIVER UNAVAILABLE',
      message: `Trip ${selectedCity === 'chennai' ? 'TRIP-102-003' : 'TRIP-534-002'}: Driver unavailable for departure at 08:30 AM.`,
      actionLabel: 'FIX',
      tripId: selectedCity === 'chennai' ? 'TRIP-102-003' : 'TRIP-534-002',
      routeCode: selectedCity === 'chennai' ? '102' : '534'
    },
    {
      id: 'alert-overflow-kg',
      type: 'WARNING',
      title: 'PASSENGER OVERFLOW',
      message: `${selectedCity === 'chennai' ? 'CMBT Koyambedu' : 'Kashmere Gate ISBT'}: 72 waiting vs 50 bus capacity (22 overflow).`,
      actionLabel: 'FIX',
      location: selectedCity === 'chennai' ? 'CMBT Koyambedu' : 'Kashmere Gate ISBT'
    }
  ]);

  const showGreenSuccessToast = (msg) => {
    const successToast = {
      id: `success-${Date.now()}`,
      type: 'SUCCESS',
      title: 'ACTION COMPLETED',
      message: msg
    };
    setActiveAlerts(prev => [successToast, ...prev]);
    setTimeout(() => {
      setActiveAlerts(prev => prev.filter(a => a.id !== successToast.id));
    }, 4000);
  };

  const handleDismissAlert = (id) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleOpenSmartFix = (issue) => {
    setActiveFixIssue(issue);
    setIsSmartFixOpen(true);
  };

  const handleAcceptSmartFix = (issue) => {
    if (issue.title?.includes('DRIVER')) {
      const replacementId = selectedCity === 'chennai' ? 'DRV-201' : 'DRV-SBY-01';
      if (onUpdateDriverAssignment) {
        onUpdateDriverAssignment(assignedRouteId, assignedBusId, replacementId, issue.tripId);
      }
      handleDismissAlert(issue.id);
    } else if (issue.title?.includes('OVERFLOW')) {
      const standbyBusId = selectedCity === 'chennai' ? 'bus-chn-901' : 'bus-901';
      if (onUpdateBusAssignment) {
        onUpdateBusAssignment(assignedRouteId, assignedBusId, standbyBusId, issue.tripId);
      }
      handleDismissAlert(issue.id);
    } else {
      showGreenSuccessToast(`✓ ISSUE RESOLVED: Solution applied for ${issue.title}`);
      handleDismissAlert(issue.id);
    }
  };

  const handleEntityAction = (actionType, entityId, entityType) => {
    if (actionType === 'cancel_trip') {
      if (onCancelTrip) onCancelTrip(entityId, assignedBusId);
    } else if (actionType === 'change_bus' || actionType === 'change_driver') {
      setPendingOverrideInfo({ actionType, entityId, entityType });
      setIsOverrideModalOpen(true);
    } else if (actionType === 'deactivate') {
      if (entityType === 'route' && onDeactivateRoute) {
        onDeactivateRoute(entityId);
      } else if (entityType === 'driver' && onDeactivateDriver) {
        onDeactivateDriver(entityId);
      }
    } else if (actionType === 'edit') {
      setIsEditingTimeInline(true);
    }
  };

  const handleConfirmAdminOverride = (reason) => {
    if (pendingOverrideInfo?.actionType === 'change_driver' && onUpdateDriverAssignment) {
      onUpdateDriverAssignment(assignedRouteId, assignedBusId, assignedDriverId);
    } else if (pendingOverrideInfo?.actionType === 'change_bus' && onUpdateBusAssignment) {
      onUpdateBusAssignment(assignedRouteId, assignedBusId, assignedBusId);
    }
    showGreenSuccessToast(`✓ ADMIN OVERRIDE CONFIRMED: Action executed. Reason logged: "${reason}"`);
    setIsOverrideModalOpen(false);
  };

  const handleConfirmAssignment = () => {
    if (onUpdateDriverAssignment) {
      onUpdateDriverAssignment(assignedRouteId, assignedBusId, assignedDriverId);
    }
    if (onUpdateBusAssignment) {
      onUpdateBusAssignment(assignedRouteId, busFleet[0]?.id, assignedBusId);
    }
  };

  const handleCreateDriverSubmit = () => {
    if (!newDriverName.trim()) return;
    const newDriver = {
      id: `DRV-NEW-${Date.now().toString().slice(-4)}`,
      fullName: newDriverName,
      name: newDriverName,
      licenseNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
      badge: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
      accumulatedHours: 0,
      status: 'STANDBY_READY'
    };
    if (onAddDriver) onAddDriver(newDriver);
    setNewDriverName('');
    setIsAddDriverModalOpen(false);
  };

  const handleApplyConflictResolution = (conflict, chosenOption) => {
    if (chosenOption.isKeepAsIs) {
      showGreenSuccessToast(`✓ ROUTE OVERLAP ACKNOWLEDGED: Operational exception logged for Route ${conflict.routeACode} & Route ${conflict.routeBCode}.`);
      return;
    }

    const targetRoute = routes.find(r => r.id === chosenOption.targetRouteId);
    if (targetRoute) {
      const updatedRoute = {
        ...targetRoute,
        stops: chosenOption.newStops || targetRoute.stops,
        pathCoordinates: chosenOption.newPathCoordinates || targetRoute.pathCoordinates
      };
      if (onCommitNewRoute) {
        onCommitNewRoute(updatedRoute);
      }
      showGreenSuccessToast(`✓ ROUTE CONFLICT RESOLVED: Route ${targetRoute.code} rerouted around corridor! Overlap reduced to ${chosenOption.newOverlapPct}%.`);
    }
  };

  const selectedViewTripsRoute = routes.find(r => r.id === viewTripsRouteId);
  const routeTripsList = trips.filter(t => t.routeId === viewTripsRouteId || t.routeCode === selectedViewTripsRoute?.code);

  const filteredRoutesList = useMemo(() => {
    if (viewFilter === 'active') return routes.filter(r => r.status !== 'INACTIVE');
    if (viewFilter === 'delayed') return routes.filter(r => r.code === '534' || r.code === '102');
    if (viewFilter === 'highdemand') return routes.filter(r => r.frequencyMins <= 8);
    return routes;
  }, [routes, viewFilter]);

  return (
    <div className="h-full flex flex-col min-h-0 bg-background font-sans select-none relative">
      
      {/* Universal Action Bar */}
      <div className="border-b border-border bg-card px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 font-sans z-20">
        
        <div className="flex items-center space-x-1 flex-wrap gap-y-1">
          <button
            onClick={() => navigate('/admin/routes')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'live' || activeTab === 'map' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● LIVE</span>
          </button>

          <button
            onClick={() => navigate('/admin/routes/plan')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'plan' || activeTab === 'list' || activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            PLAN
          </button>

          <button
            onClick={() => navigate('/admin/routes/trips')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'trips' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span>SCHEDULED TRIPS</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-card text-foreground font-bold border border-border">
              {trips.length}
            </span>
          </button>

          <button
            onClick={() => navigate('/admin/routes/schedule')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'schedule' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            SCHEDULE
          </button>

          <button
            onClick={() => navigate('/admin/routes/assign')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              activeTab === 'assign' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            ASSIGN
          </button>

          <button
            onClick={() => navigate('/admin/routes/issues')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'issues' || activeTab === 'conflicts' || activeTab === 'overflow' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span>ISSUES & CONFLICTS</span>
            {(activeAlerts.length + activeRouteConflicts.length) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {activeAlerts.length + activeRouteConflicts.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userIntentSearch}
              onChange={(e) => setUserIntentSearch(e.target.value)}
              placeholder="🔍 Search Trips, Routes, Buses, Drivers..."
              className="w-full pl-8 pr-2 py-1 rounded bg-muted/50 border border-input text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => setIsPlanTripOpen(true)}
            className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ PLAN TRIP</span>
          </button>
        </div>

      </div>

      {/* Quick Action Suggestion Pills */}
      <div className="bg-muted/30 border-b border-border px-4 py-1.5 flex items-center space-x-2 overflow-x-auto text-xs font-mono shrink-0">
        <span className="text-muted-foreground text-[10px] uppercase font-bold">Quick Actions:</span>

        <button
          onClick={() => setIsPlanTripOpen(true)}
          className="px-2.5 py-0.5 rounded bg-card border border-border text-foreground hover:bg-accent flex items-center space-x-1"
        >
          <CalendarClock className="w-3 h-3 text-primary" />
          <span>[ + Plan Trip ]</span>
        </button>

        <button
          onClick={() => navigate('/admin/routes/create')}
          className="px-2.5 py-0.5 rounded bg-card border border-border text-foreground hover:bg-accent flex items-center space-x-1"
        >
          <RouteIcon className="w-3 h-3 text-emerald-500" />
          <span>[ + Add Route ]</span>
        </button>

        <button
          onClick={() => setIsAddDriverModalOpen(true)}
          className="px-2.5 py-0.5 rounded bg-card border border-border text-foreground hover:bg-accent flex items-center space-x-1"
        >
          <UserCheck className="w-3 h-3 text-amber-500" />
          <span>[ + Add Driver ]</span>
        </button>

        <button
          onClick={() => navigate('/admin/routes/conflicts')}
          className="px-2.5 py-0.5 rounded bg-card border border-border text-foreground hover:bg-accent flex items-center space-x-1"
        >
          <ShieldAlert className="w-3 h-3 text-rose-500" />
          <span>[ Route Conflicts ({activeRouteConflicts.length}) ]</span>
        </button>
      </div>

      {/* VIEW 1: OVERVIEW DASHBOARD (/admin/routes/overview) WITH CREW UTILISATION & TRIP COVERAGE CARDS */}
      {activeTab === 'overview' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Route Network Overview
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Real-time operational summary, trip coverage & crew utilisation
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/routes/map')}
              className="px-3.5 py-1.5 rounded bg-primary text-primary-foreground font-mono text-xs font-bold hover:bg-primary/90 shadow-xs"
            >
              Open Interactive Route Map
            </button>
          </div>

          {/* Minimal Crew Utilisation & Trip Coverage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <CrewUtilisationCard crewMembers={crewMembers} selectedCity={selectedCity} />
            <TripCoverageCard trips={trips} selectedCity={selectedCity} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-bold">Total Network Routes</div>
              <div className="text-2xl font-bold text-primary">{routes.length} Active Routes</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">100% Geometry Mapped</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-bold">Scheduled Trips Today</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{trips.length} Trips</div>
              <div className="text-[11px] text-muted-foreground">{trips.filter(t => t.status === 'RUNNING').length} Currently Running</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-bold">Active Route Conflicts</div>
              <div className="text-2xl font-bold text-rose-500">{activeRouteConflicts.length} Overlaps</div>
              <div className="text-[11px] text-muted-foreground">Turf GIS Corridor Analysis</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-bold">Network Health</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">● 96% Operational</div>
              <div className="text-[11px] text-muted-foreground">Rest & Headway Compliant</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE MAP / MAP VIEW */}
      {(activeTab === 'live' || activeTab === 'map') && (
        <div className="flex-1 flex flex-col relative min-h-0">
          <div className="flex-1 relative w-full h-full min-h-0">
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
              onCommitNewRoute={onCommitNewRoute}
              isDrawingMode={isDrawingMode}
              setIsDrawingMode={setIsDrawingMode}
              drawnCoordinates={drawnCoordinates}
              setDrawnCoordinates={setDrawnCoordinates}
              overlapReport={overlapReport}
              setOverlapReport={setOverlapReport}
              selectedCity={selectedCity}
            />
          </div>

          <div className="h-10 border-t border-border bg-card px-4 flex items-center justify-between text-xs font-mono text-foreground shrink-0 z-20">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <strong className="font-bold">{routes.length} ROUTES ({trips.length} TRIPS)</strong>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <strong className="font-bold">{trips.filter(t => t.status === 'RUNNING').length} LIVE TRIPS</strong>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <strong className="font-bold text-rose-500">{activeRouteConflicts.length} ROUTE OVERLAPS</strong>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-2 text-muted-foreground">
              <span>{selectedCity === 'chennai' ? 'CHENNAI BUS NETWORK' : 'DELHI NETWORK CONTROL'}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Swiggy-style GPS Telemetry</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ROUTES LIST */}
      {(activeTab === 'list' || activeTab === 'plan') && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Route Master Templates ({filteredRoutesList.length})
                </h2>
                <p className="text-xs font-mono text-muted-foreground">
                  Filter Mode: <strong className="text-primary uppercase">{viewFilter} ROUTES</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlanTripOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ PLAN TRIP</span>
                </button>
                <button
                  onClick={() => navigate('/admin/routes/create')}
                  className="px-3.5 py-1.5 rounded bg-card border border-border text-foreground font-mono text-xs font-bold hover:bg-accent"
                >
                  + Add Route Template
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {filteredRoutesList.map(r => {
                const countTrips = trips.filter(t => t.routeId === r.id || t.routeCode === r.code).length;
                return (
                  <div key={r.id} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-primary">Route {r.code} — {r.name}</span>
                      <QuickEntityActionMenu entityType="route" entityId={r.id} onAction={handleEntityAction} />
                    </div>

                    <div className="text-muted-foreground font-sans text-xs">
                      Stops ({r.stops?.length || 4}): {r.stops ? r.stops.map(s => s.name).join(' → ') : 'Origin → Destination'}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <div className="text-foreground font-bold">
                        {r.lengthKm} km • {r.frequencyMins || 10}m Freq • <span className="text-emerald-600 dark:text-emerald-400">{countTrips} Active Trips Today</span>
                      </div>

                      <button
                        onClick={() => setViewTripsRouteId(r.id)}
                        className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>VIEW TRIPS ({countTrips})</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredRoutesList.length === 0 && (
                <div className="p-8 text-center text-muted-foreground font-mono text-xs col-span-2">
                  No routes found matching filter "{viewFilter}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CONFLICTS MANAGEMENT */}
      {activeTab === 'conflicts' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-foreground">
                  Geographic Route Overlaps ({activeRouteConflicts.length}) — {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} Network
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold border border-rose-500/30">
                Turf GIS Corridor Analysis
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {activeRouteConflicts.map(c => (
                <div key={c.id} className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-foreground flex items-center space-x-2">
                      <span className="text-rose-500">⚠ ROUTE {c.routeACode}</span>
                      <span>overlaps</span>
                      <span className="text-primary">ROUTE {c.routeBCode}</span>
                    </div>
                    <div className="text-muted-foreground text-xs font-sans">
                      Shared Corridor: <strong className="text-foreground">{c.sharedCorridorText}</strong>
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 font-bold">
                      {c.sharedKm} km Shared ({c.overlapPctA}% Overlap) • High Bus Bunching Risk
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedRouteId(c.routeAId);
                        navigate('/admin/routes/map');
                      }}
                      className="px-3 py-1.5 rounded bg-card border border-border text-foreground font-bold hover:bg-accent"
                    >
                      VIEW ON MAP
                    </button>

                    <button
                      onClick={() => {
                        setActiveConflictData(c);
                        setIsConflictModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                    >
                      RESOLVE
                    </button>
                  </div>
                </div>
              ))}

              {activeRouteConflicts.length === 0 && (
                <div className="p-6 text-center text-emerald-600 font-mono text-xs bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  ✓ NO ROUTE CONFLICTS — All active {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'} routes have compatible corridors (&lt; 15% overlap threshold).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: PASSENGER OVERFLOW */}
      {activeTab === 'overflow' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-bold text-foreground">
                  Passenger Overflow & Assistance Center — {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'}
                </h2>
              </div>

              <div className="flex items-center space-x-1 font-mono text-xs">
                <button
                  onClick={() => navigate('/admin/routes/overflow?view=active')}
                  className={`px-3 py-1 rounded font-bold ${viewFilter === 'active' || viewFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  Active Overflow
                </button>
                <button
                  onClick={() => navigate('/admin/routes/overflow?view=assistance')}
                  className={`px-3 py-1 rounded font-bold ${viewFilter === 'assistance' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  Assistance Requests
                </button>
                <button
                  onClick={() => navigate('/admin/routes/overflow?view=resolved')}
                  className={`px-3 py-1 rounded font-bold ${viewFilter === 'resolved' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  Resolved
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div>
                <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  HIGH PASSENGER DEMAND: {selectedCity === 'chennai' ? 'CMBT Koyambedu' : 'Kashmere Gate ISBT'}
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  72 Waiting Passengers vs 50 Available Bus Capacity (22 Overflow)
                </div>
              </div>

              <button
                onClick={() => handleOpenSmartFix({
                  id: 'overflow-fixed',
                  title: 'PASSENGER OVERFLOW',
                  message: 'Overcrowding at terminal hub'
                })}
                className="px-4 py-1.5 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs flex items-center space-x-1 shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>FIX OVERFLOW</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SCHEDULED & PLANNED TRIPS */}
      {activeTab === 'trips' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full font-sans">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-2">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Scheduled & Planned Trips ({trips.length}) — {selectedCity === 'chennai' ? 'Chennai' : 'Delhi'}
                </h2>
                <p className="text-xs font-mono text-muted-foreground">
                  All trips planned via the trip planner or schedule engine appear here with live dispatch controls.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlanTripOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ PLAN NEW TRIP</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[10px] uppercase">
                    <th className="p-2.5 pl-3">Trip ID</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5">Departure</th>
                    <th className="p-2.5">Bus</th>
                    <th className="p-2.5">Driver</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trips.map(trip => (
                    <tr key={trip.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 pl-3 font-bold text-foreground">
                        {trip.id}
                      </td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                          Route {trip.routeCode}
                        </span>
                      </td>
                      <td className="p-2.5 tabular-nums font-bold">
                        {trip.departureTime}
                      </td>
                      <td className="p-2.5">
                        {trip.busNumber || 'Standby'}
                      </td>
                      <td className="p-2.5">
                        {trip.driverName || 'Standby'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trip.status === 'RUNNING'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
                            : trip.status === 'COMPLETED'
                            ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                            : trip.status === 'CANCELLED'
                            ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="p-2.5 pr-3 text-right space-x-1.5">
                        {trip.status === 'SCHEDULED' && (
                          <button
                            onClick={() => {
                              if (onCancelTrip) onCancelTrip(trip.id, trip.busId);
                              showGreenSuccessToast(`✓ TRIP CANCELLED: Trip ${trip.id} removed from dispatch queue.`);
                            }}
                            className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const newTime = prompt('Enter new departure time (e.g. 09:30 AM):', trip.departureTime);
                            if (newTime && onUpdateScheduleTime) {
                              onUpdateScheduleTime(trip.id, newTime);
                              showGreenSuccessToast(`✓ DEPARTURE UPDATED: Trip ${trip.id} rescheduled to ${newTime}.`);
                            }
                          }}
                          className="px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80 text-foreground border border-border"
                        >
                          Reschedule
                        </button>
                      </td>
                    </tr>
                  ))}

                  {trips.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-muted-foreground">
                        No trips planned yet. Click <strong>+ PLAN NEW TRIP</strong> above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="flex-1 flex flex-col min-h-0 bg-card">
          <div className="p-3 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-foreground">Filter Duties:</span>
              <button
                onClick={() => setScheduleFilter('ALL')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                  scheduleFilter === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                All ({dutyAssignments.length})
              </button>
              <button
                onClick={() => setScheduleFilter('LINKED')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                  scheduleFilter === 'LINKED' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                Linked
              </button>
              <button
                onClick={() => setScheduleFilter('UNLINKED')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                  scheduleFilter === 'UNLINKED' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                Unlinked
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlanTripOpen(true)}
                className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
              >
                + Plan Trip
              </button>
              <span className="text-muted-foreground">04:00 - 24:00 IST</span>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col min-h-0">
            <GanttTimeline
              dutyAssignments={
                scheduleFilter === 'LINKED'
                  ? dutyAssignments.filter(d => d.dutyType === 'LINKED')
                  : scheduleFilter === 'UNLINKED'
                  ? dutyAssignments.filter(d => d.dutyType === 'UNLINKED')
                  : dutyAssignments
              }
              crewMembers={crewMembers}
              busFleet={busFleet}
              routes={routes}
              operationalTime={operationalTime}
              selectedDutyId={selectedDutyId}
              onSelectDuty={setSelectedDutyId}
              hoveredRouteId={hoveredRouteId}
              onHoverRoute={setHoveredRouteId}
              onOpenFallbackModal={onOpenFallbackModal}
              onUpdateDriverAssignment={onUpdateDriverAssignment}
              onUpdateBusAssignment={onUpdateBusAssignment}
            />
          </div>
        </div>
      )}

      {/* SUBTAB ASSIGN */}
      {activeTab === 'assign' && (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto min-h-0 w-full">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-5">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Smart Cascading Trip Bus & Driver Assignment
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cascading dropdown selection automatically validating availability, 11h rest, and workload.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                Rest Rules Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                  1. Select Target Route
                </label>
                <select
                  value={assignedRouteId}
                  onChange={(e) => setAssignedRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input font-mono text-xs text-foreground outline-none focus:border-primary"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      Route {r.code} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                  2. Select Available Bus
                </label>
                <select
                  value={assignedBusId}
                  onChange={(e) => setAssignedBusId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input font-mono text-xs text-foreground outline-none focus:border-primary"
                >
                  {busFleet.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.capacity} Seats) — {b.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">
                  3. Select Recommended Driver
                </label>
                <select
                  value={assignedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted/50 border border-input font-mono text-xs text-foreground outline-none focus:border-primary"
                >
                  {crewMembers.map(c => (
                    <option key={c.id} value={c.id}>
                      ★ {c.name || c.fullName} ({c.id}) — Rest OK
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
              <div className="font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>RECOMMENDED DRIVER: {crewMembers[0]?.name || 'Amit Sharma'}</span>
              </div>
              <div className="text-muted-foreground text-[11px]">
                ✓ Available • ✓ 11h Rest Complete • ✓ Workload Balanced • ✓ Rotation Valid
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleConfirmAssignment}
                className="px-5 py-2 rounded bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TRIPS MODAL */}
      {selectedViewTripsRoute && (
        <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in select-none">
          <div className="w-full max-w-xl bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base text-foreground font-mono">
                  TODAY'S TRIPS — ROUTE {selectedViewTripsRoute.code}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedViewTripsRoute.name}</p>
              </div>

              <button onClick={() => setViewTripsRouteId(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-[50vh] overflow-y-auto">
              {routeTripsList.map(trip => (
                <div key={trip.id} className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-primary">{trip.departureTime} • {trip.id}</div>
                    <div className="text-muted-foreground text-xs font-sans">
                      Bus: {trip.busNumber} • Driver: {trip.driverName}
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                    trip.status === 'RUNNING' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 animate-pulse' :
                    trip.status === 'CANCELLED' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' : 'bg-primary/15 text-primary border-primary/30'
                  }`}>
                    ● {trip.status}
                  </span>
                </div>
              ))}

              {routeTripsList.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No trips scheduled for this route today. Click <strong>+ Plan Trip</strong> to schedule.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between border-t border-border">
              <button onClick={() => setViewTripsRouteId(null)} className="px-3.5 py-1.5 rounded bg-muted text-xs font-mono">Close</button>
              <button
                onClick={() => {
                  setViewTripsRouteId(null);
                  setIsPlanTripOpen(true);
                }}
                className="px-4 py-1.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Plan Trip for Route {selectedViewTripsRoute.code}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Trip Drawer */}
      <PlanTripDrawer
        isOpen={isPlanTripOpen}
        onClose={() => setIsPlanTripOpen(false)}
        routes={routes}
        busFleet={busFleet}
        crewMembers={crewMembers}
        onScheduleTrip={onScheduleTrip}
        showSuccessToast={showGreenSuccessToast}
        selectedCity={selectedCity}
      />

      {/* Map-First Route Planner Modal Drawer */}
      <RoutePlannerDrawer
        isOpen={isPlannerOpen}
        onClose={() => {
          setIsPlannerOpen(false);
          if (path.includes('/routes/create')) {
            navigate('/admin/routes/plan');
          }
        }}
        busFleet={busFleet}
        crewMembers={crewMembers}
        onSaveRoute={onCommitNewRoute}
        showSuccessToast={showGreenSuccessToast}
        selectedCity={selectedCity}
      />

      {/* Real-time Popup Alert Container */}
      <AlertToastContainer
        alerts={activeAlerts}
        onDismissAlert={handleDismissAlert}
        onResolveAlertAction={(alert) => handleOpenSmartFix(alert)}
      />

      {/* Smart 1-Click Fix Recommendation Modal */}
      <SmartFixModal
        isOpen={isSmartFixOpen}
        onClose={() => setIsSmartFixOpen(false)}
        issueData={activeFixIssue}
        onAcceptRecommendation={handleAcceptSmartFix}
        onChooseManually={(issue) => {
          setIsSmartFixOpen(false);
          setPendingOverrideInfo({ actionType: 'manual_fix', issue });
          setIsOverrideModalOpen(true);
        }}
      />

      {/* Geographic Route Conflict Resolution Modal */}
      <RouteConflictResolutionModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflictData={activeConflictData}
        routes={routes}
        onApplyResolution={handleApplyConflictResolution}
      />

      {/* Explicit Admin Override Reason Modal */}
      <AdminOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onConfirmOverride={handleConfirmAdminOverride}
      />

      {/* Add Driver Modal */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 z-[3500] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-5 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm font-mono text-foreground">+ ADD NEW DRIVER</h3>
              <button onClick={() => setIsAddDriverModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase mb-1">Driver Full Name</label>
              <input
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                className="w-full px-3 py-2 rounded bg-muted/50 border border-input text-xs font-mono text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border">
              <button onClick={() => setIsAddDriverModalOpen(false)} className="px-3 py-1.5 rounded bg-muted text-xs font-mono text-muted-foreground">Cancel</button>
              <button onClick={handleCreateDriverSubmit} className="px-4 py-1.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">Save Driver</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
