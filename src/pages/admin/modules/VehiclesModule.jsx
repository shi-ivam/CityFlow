import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Wrench, 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  RefreshCw, 
  Download, 
  Layers, 
  FileText, 
  History, 
  Route, 
  UserCheck, 
  Radio, 
  Calendar,
  LayoutGrid,
  Columns,
  ShieldCheck,
  Zap,
  Bell,
  AlertOctagon,
  BarChart3,
  Sliders,
  ExternalLink
} from 'lucide-react';

import { calculateFleetMetrics, calculateFleetReadinessScore, generateFleetExport } from '../../../services/vehicleService';

import FleetKPICards from '../../../components/admin/vehicles/FleetKPICards';
import FleetHealth from '../../../components/admin/vehicles/FleetHealth';
import VehicleToolbar from '../../../components/admin/vehicles/VehicleToolbar';
import VehicleTable from '../../../components/admin/vehicles/VehicleTable';
import VehicleBulkActionBar from '../../../components/admin/vehicles/VehicleBulkActionBar';
import VehicleDetailsDrawer from '../../../components/admin/vehicles/VehicleDetailsDrawer';
import VehicleFullProfileModal from '../../../components/admin/vehicles/VehicleFullProfileModal';
import AddEditVehicleModal from '../../../components/admin/vehicles/AddEditVehicleModal';
import VehicleAssignmentModal from '../../../components/admin/vehicles/VehicleAssignmentModal';
import ScheduleMaintenanceModal from '../../../components/admin/vehicles/ScheduleMaintenanceModal';
import VehicleAvailabilityTimeline from '../../../components/admin/vehicles/VehicleAvailabilityTimeline';
import VehicleMaintenanceQueue from '../../../components/admin/vehicles/VehicleMaintenanceQueue';
import VehicleDocumentsView from '../../../components/admin/vehicles/VehicleDocumentsView';
import VehicleMapView from '../../../components/admin/vehicles/VehicleMapView';

// Command Center Sub-Views
import VehicleCommandPalette from '../../../components/admin/vehicles/VehicleCommandPalette';
import FleetReadinessModal from '../../../components/admin/vehicles/FleetReadinessModal';
import VehicleDispatchModal from '../../../components/admin/vehicles/VehicleDispatchModal';
import VehicleChargingCenter from '../../../components/admin/vehicles/VehicleChargingCenter';
import VehicleAlertsCenter from '../../../components/admin/vehicles/VehicleAlertsCenter';
import VehicleIncidentsCenter from '../../../components/admin/vehicles/VehicleIncidentsCenter';
import VehicleAnalyticsCenter from '../../../components/admin/vehicles/VehicleAnalyticsCenter';

export default function VehiclesModule({ 
  busFleet = [], 
  dutyAssignments = [], 
  routes = [],
  crewMembers = [],
  trips = [],
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onUpdateVehicleAssignment,
  onScheduleMaintenance
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Active sub-feature detection
  const [internalTab, setInternalTab] = useState('overview');

  useEffect(() => {
    if (path.includes('/vehicles/fleet')) setInternalTab('fleet');
    else if (path.includes('/vehicles/livestatus')) setInternalTab('livestatus');
    else if (path.includes('/vehicles/assignments')) setInternalTab('assignments');
    else if (path.includes('/vehicles/availability')) setInternalTab('availability');
    else if (path.includes('/vehicles/maintenance')) setInternalTab('maintenance');
    else if (path.includes('/vehicles/charging')) setInternalTab('charging');
    else if (path.includes('/vehicles/incidents')) setInternalTab('incidents');
    else if (path.includes('/vehicles/alerts')) setInternalTab('alerts');
    else if (path.includes('/vehicles/documents')) setInternalTab('documents');
    else if (path.includes('/vehicles/analytics')) setInternalTab('analytics');
    else setInternalTab('overview');
  }, [path]);

  // Metrics & Calculations
  const metrics = calculateFleetMetrics(busFleet);
  const readiness = calculateFleetReadinessScore(busFleet, crewMembers);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    fuelType: 'ALL',
    depot: 'ALL',
    battery: 'ALL',
    maintenance: 'ALL',
    gps: 'ALL'
  });

  // Table Config
  const [density, setDensity] = useState('compact');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [columnsConfig, setColumnsConfig] = useState({
    status: true,
    assetId: true,
    registration: true,
    vehicleType: true,
    depot: true,
    route: true,
    driver: true,
    speed: true,
    battery: true,
    odometer: true,
    nextService: true,
    lastGpsUpdate: true
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection & Bulk Actions
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

  // Modals & Drawer State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchTargetVehicle, setDispatchTargetVehicle] = useState(null);
  const [selectedDrawerVehicle, setSelectedDrawerVehicle] = useState(null);
  const [fullProfileVehicle, setFullProfileVehicle] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editTargetVehicle, setEditTargetVehicle] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetVehicle, setAssignTargetVehicle] = useState(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceTargetVehicle, setMaintenanceTargetVehicle] = useState(null);

  // Live Status View Mode
  const [liveViewMode, setLiveViewMode] = useState('split');

  // Refresh & Feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('✓ Live fleet telemetry & GPS synchronized with Delhi transit server.');
    }, 600);
  };

  const handleSort = (columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleToggleColumn = (colKey) => {
    setColumnsConfig(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const handleResetColumns = () => {
    setColumnsConfig({
      status: true,
      assetId: true,
      registration: true,
      vehicleType: true,
      depot: true,
      route: true,
      driver: true,
      speed: true,
      battery: true,
      odometer: true,
      nextService: true,
      lastGpsUpdate: true
    });
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'ALL',
      fuelType: 'ALL',
      depot: 'ALL',
      battery: 'ALL',
      maintenance: 'ALL',
      gps: 'ALL'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filtered & Sorted Vehicles
  const filteredVehicles = useMemo(() => {
    return busFleet.filter(bus => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !term ||
        bus.id?.toLowerCase().includes(term) ||
        bus.busNumber?.toLowerCase().includes(term) ||
        bus.type?.toLowerCase().includes(term) ||
        bus.assignedRoute?.toLowerCase().includes(term) ||
        bus.assignedDriver?.toLowerCase().includes(term) ||
        bus.depot?.toLowerCase().includes(term) ||
        bus.status?.toLowerCase().includes(term);

      const matchesStatus = 
        filters.status === 'ALL' || 
        bus.status === filters.status ||
        (filters.status === 'STANDBY_READY' && (bus.status === 'AVAILABLE' || bus.status === 'STANDBY_READY'));

      const matchesFuel = 
        filters.fuelType === 'ALL' || 
        bus.fuelType === filters.fuelType;

      const matchesDepot = 
        filters.depot === 'ALL' || 
        bus.depot === filters.depot;

      let matchesBattery = true;
      if (filters.battery === 'CRITICAL') matchesBattery = (bus.batteryPct || 100) <= 20;
      else if (filters.battery === 'LOW') matchesBattery = (bus.batteryPct || 100) > 20 && (bus.batteryPct || 100) <= 50;
      else if (filters.battery === 'NORMAL') matchesBattery = (bus.batteryPct || 100) > 50;

      let matchesMaint = true;
      if (filters.maintenance === 'DUE_THIS_WEEK') {
        matchesMaint = bus.nextServiceDate && (new Date(bus.nextServiceDate) - new Date() < 15 * 86400000);
      }

      let matchesGps = true;
      if (filters.gps === 'ONLINE') matchesGps = bus.gpsStatus !== 'OFFLINE';
      else if (filters.gps === 'OFFLINE') matchesGps = bus.gpsStatus === 'OFFLINE';

      return matchesSearch && matchesStatus && matchesFuel && matchesDepot && matchesBattery && matchesMaint && matchesGps;
    }).sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key] ?? '';
      let valB = b[key] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [busFleet, searchTerm, filters, sortConfig]);

  // Paginated Slices
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, currentPage, pageSize]);

  // Bulk Selection Handlers
  const handleToggleSelectVehicle = (vehicleId) => {
    setSelectedVehicleIds(prev => 
      prev.includes(vehicleId) ? prev.filter(id => id !== vehicleId) : [...prev, vehicleId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedVehicleIds.length === paginatedVehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(paginatedVehicles.map(v => v.id));
    }
  };

  // Export
  const handleExport = (format) => {
    const content = generateFleetExport(filteredVehicles, format);

    if (format === 'csv') {
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + content);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `CityFlow_Vehicles_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Exported ${filteredVehicles.length} records to CSV.`);
    } else if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(content);
      const link = document.createElement('a');
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `CityFlow_Vehicles_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Exported ${filteredVehicles.length} records to JSON.`);
    } else if (format === 'print') {
      window.print();
    }
  };

  // Mutation Handlers
  const handleSaveVehicle = (vehicleData) => {
    if (editTargetVehicle) {
      if (onUpdateVehicle) onUpdateVehicle(vehicleData);
      showToast(`✓ Updated specs for vehicle ${vehicleData.busNumber}`);
    } else {
      if (onAddVehicle) onAddVehicle(vehicleData);
      showToast(`✓ Registered new vehicle ${vehicleData.busNumber} to fleet!`);
    }
  };

  const handleSaveAssignment = (assignmentData) => {
    if (onUpdateVehicleAssignment) onUpdateVehicleAssignment(assignmentData);
    showToast(`✓ Vehicle ${assignmentData.vehicleId} assigned to Route ${assignmentData.assignedRoute} (${assignmentData.assignedDriver})`);
  };

  const handleSaveMaintenance = (maintenanceData) => {
    if (onScheduleMaintenance) onScheduleMaintenance(maintenanceData);
    showToast(`✓ Work Order issued for ${maintenanceData.vehicleId} at ${maintenanceData.workshop}`);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto font-sans text-foreground">
      
      {/* 1. ELEGANT SPACIOUS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
            <span>CityFlow</span>
            <span>•</span>
            <span>Delhi Operations</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">All Systems Nominal</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            Vehicle Fleet Command
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            Asset tracking, dispatch readiness, telemetry, and workshop maintenance.
          </p>
        </div>

        {/* Clean Header Actions */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-lg bg-card border border-border/70 hover:border-border text-foreground transition flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-foreground text-background font-bold hover:opacity-90 transition flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Dispatch</span>
          </button>
        </div>
      </div>

      {/* 2. MINIMALIST STATS STRIP */}
      <FleetKPICards
        busFleet={busFleet}
        activeFilter={filters.status}
        onSelectFilter={(statusKey) => handleFilterChange('status', statusKey)}
      />

      {/* 3. SLIM READINESS & HEALTH INDICATOR */}
      <FleetHealth
        busFleet={busFleet}
        onSelectStatus={(statusKey) => handleFilterChange('status', statusKey)}
      />

      {/* 4. STREAMLINED CLEAN SUB-NAVIGATION */}
      <div className="border-b border-border/50">
        <div className="flex items-center space-x-6 text-xs font-mono overflow-x-auto -mb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'livestatus', label: 'Live Telemetry & Map' },
            { id: 'assignments', label: 'Roster' },
            { id: 'availability', label: 'Availability' },
            { id: 'maintenance', label: `Workshop (${metrics.maintenance})` },
            { id: 'charging', label: 'EV Charging' },
            { id: 'incidents', label: 'Incidents' },
            { id: 'alerts', label: `Alerts (${metrics.critical})` },
            { id: 'documents', label: 'Compliance' },
            { id: 'analytics', label: 'Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setInternalTab(tab.id)}
              className={`py-3 border-b-2 font-medium transition cursor-pointer shrink-0 ${
                internalTab === tab.id
                  ? 'border-foreground text-foreground font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. SUB-FEATURE VIEWS */}
      
      {/* VIEW A: OVERVIEW & FLEET TABLE */}
      {(internalTab === 'overview' || internalTab === 'fleet') && (
        <div className="space-y-6">
          <VehicleToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            columnsConfig={columnsConfig}
            onToggleColumn={handleToggleColumn}
            onResetColumns={handleResetColumns}
            onRefresh={handleRefresh}
            onAddVehicle={() => {
              setEditTargetVehicle(null);
              setIsAddEditModalOpen(true);
            }}
            onExport={handleExport}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            totalResults={filteredVehicles.length}
            isRefreshing={isRefreshing}
            density={density}
            onDensityChange={setDensity}
            onSelectSavedView={(savedFilters) => setFilters(savedFilters)}
          />

          <VehicleTable
            vehicles={paginatedVehicles}
            routes={routes}
            crewMembers={crewMembers}
            selectedVehicleIds={selectedVehicleIds}
            onToggleSelectVehicle={handleToggleSelectVehicle}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenVehicleDrawer={(vehicle) => setSelectedDrawerVehicle(vehicle)}
            onEditVehicle={(vehicle) => {
              setEditTargetVehicle(vehicle);
              setIsAddEditModalOpen(true);
            }}
            onAssignVehicle={(vehicle) => {
              setAssignTargetVehicle(vehicle);
              setIsAssignModalOpen(true);
            }}
            onScheduleMaintenance={(vehicle) => {
              setMaintenanceTargetVehicle(vehicle);
              setIsMaintenanceModalOpen(true);
            }}
            sortConfig={sortConfig}
            onSort={handleSort}
            columnsConfig={columnsConfig}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            totalItems={filteredVehicles.length}
          />
        </div>
      )}

      {/* VIEW B: LIVE TELEMETRY & MAP */}
      {internalTab === 'livestatus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-3.5 rounded-xl border border-border/70 shadow-xs font-mono text-xs">
            <div className="flex items-center space-x-2 text-foreground font-bold">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Real-Time Fleet Telemetry &amp; GPS Spatial Tracking</span>
            </div>

            <div className="flex items-center space-x-1 bg-muted/40 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setLiveViewMode('split')}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  liveViewMode === 'split' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setLiveViewMode('map')}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  liveViewMode === 'map' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Full Map
              </button>
              <button
                onClick={() => setLiveViewMode('table')}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  liveViewMode === 'table' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Telemetry Grid
              </button>
            </div>
          </div>

          {liveViewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
              <div className="lg:col-span-7 h-[500px]">
                <VehicleMapView
                  busFleet={busFleet}
                  routes={routes}
                  selectedVehicleId={selectedDrawerVehicle?.id}
                  onSelectVehicle={(v) => setSelectedDrawerVehicle(v)}
                />
              </div>

              <div className="lg:col-span-5 space-y-3 overflow-y-auto max-h-[500px] pr-1 font-mono text-xs">
                {busFleet.map(bus => (
                  <div
                    key={bus.id}
                    onClick={() => setSelectedDrawerVehicle(bus)}
                    className="p-4 bg-card border border-border/70 hover:border-border rounded-xl transition cursor-pointer space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{bus.busNumber}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {bus.speedKmH > 0 ? `${bus.speedKmH} km/h` : 'Idle'}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px] flex justify-between">
                      <span>Route {bus.assignedRoute || 'Standby'}</span>
                      <span>Battery: <strong className="text-foreground">{bus.batteryPct}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {liveViewMode === 'map' && (
            <div className="h-[650px]">
              <VehicleMapView
                busFleet={busFleet}
                routes={routes}
                selectedVehicleId={selectedDrawerVehicle?.id}
                onSelectVehicle={(v) => setSelectedDrawerVehicle(v)}
              />
            </div>
          )}

          {liveViewMode === 'table' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {busFleet.map(bus => (
                <div
                  key={bus.id}
                  onClick={() => setSelectedDrawerVehicle(bus)}
                  className="p-5 bg-card border border-border/70 rounded-xl shadow-xs space-y-3 hover:border-border transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-base text-foreground">{bus.busNumber}</div>
                      <div className="text-[11px] text-muted-foreground">{bus.id} • {bus.type}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                      {bus.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2.5 rounded-lg border border-border/60 text-center">
                    <div>
                      <div className="text-[9px] text-muted-foreground">SPEED</div>
                      <div className="font-bold text-foreground mt-0.5">{bus.speedKmH} km/h</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground">BATTERY</div>
                      <div className="font-bold text-emerald-600 mt-0.5">{bus.batteryPct}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground">RANGE</div>
                      <div className="font-bold text-foreground mt-0.5">{bus.rangeKm || 180} km</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW C: ASSIGNMENTS / DISPATCH ROSTER */}
      {internalTab === 'assignments' && (
        <div className="relative bg-gradient-to-br from-card via-card/95 to-muted/20 border border-border/70 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Delhi Transit Operations
              </div>
              <h2 className="text-2xl font-light tracking-tight text-foreground mt-0.5">
                Corridor Dispatch &amp; Crew Roster
              </h2>
              <p className="text-xs text-muted-foreground font-light">
                Manage operational pairings between fleet buses, transit corridors, and duty drivers.
              </p>
            </div>

            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition flex items-center space-x-2 cursor-pointer shadow-xs shrink-0"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Dispatch New Vehicle</span>
            </button>
          </div>

          <div className="divide-y divide-border/40">
            {busFleet.map(bus => (
              <div key={bus.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 px-3 rounded-xl transition">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-muted/80 text-foreground flex items-center justify-center font-bold">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm flex items-center space-x-2">
                      <span>{bus.busNumber}</span>
                      <span className="text-xs font-normal text-muted-foreground">({bus.id})</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-light">
                      {bus.type} • {bus.capacity} Seats • {bus.batteryPct}% Battery
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="px-3.5 py-2 rounded-xl bg-card/80 border border-border/60">
                    <span className="text-muted-foreground">Route: </span>
                    <strong className="text-foreground">{bus.assignedRoute ? `Route ${bus.assignedRoute}` : 'Depot Standby'}</strong>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-card/80 border border-border/60">
                    <span className="text-muted-foreground">Driver: </span>
                    <strong className="text-foreground">{bus.assignedDriver || 'Unassigned'}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setAssignTargetVehicle(bus);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW D: AVAILABILITY TIMELINE */}
      {internalTab === 'availability' && (
        <VehicleAvailabilityTimeline
          busFleet={busFleet}
          onOpenVehicleDrawer={(bus) => setSelectedDrawerVehicle(bus)}
        />
      )}

      {/* VIEW E: MAINTENANCE WORKSHOP QUEUE */}
      {internalTab === 'maintenance' && (
        <VehicleMaintenanceQueue
          busFleet={busFleet}
          onScheduleMaintenance={(bus) => {
            setMaintenanceTargetVehicle(bus);
            setIsMaintenanceModalOpen(true);
          }}
          onResolveMaintenance={(orderId) => {
            showToast(`✓ Work order ${orderId} resolved and signed off.`);
          }}
        />
      )}

      {/* VIEW F: EV CHARGING & ENERGY */}
      {internalTab === 'charging' && (
        <VehicleChargingCenter
          busFleet={busFleet}
          onUpdateVehicle={onUpdateVehicle}
        />
      )}

      {/* VIEW G: INCIDENTS & FAULTS */}
      {internalTab === 'incidents' && (
        <VehicleIncidentsCenter
          busFleet={busFleet}
          onOpenVehicleDrawer={(bus) => setSelectedDrawerVehicle(bus)}
        />
      )}

      {/* VIEW H: ALERTS CENTER */}
      {internalTab === 'alerts' && (
        <VehicleAlertsCenter
          busFleet={busFleet}
          onOpenVehicleDrawer={(bus) => setSelectedDrawerVehicle(bus)}
        />
      )}

      {/* VIEW I: COMPLIANCE DOCUMENTS */}
      {internalTab === 'documents' && (
        <VehicleDocumentsView busFleet={busFleet} />
      )}

      {/* VIEW J: PERFORMANCE ANALYTICS */}
      {internalTab === 'analytics' && (
        <VehicleAnalyticsCenter
          busFleet={busFleet}
          onOpenVehicleDrawer={(bus) => setSelectedDrawerVehicle(bus)}
        />
      )}

      {/* 6. FLOATING BULK ACTIONS BAR */}
      <VehicleBulkActionBar
        selectedCount={selectedVehicleIds.length}
        onClearSelection={() => setSelectedVehicleIds([])}
        onBulkAssignRoute={() => {
          showToast(`✓ Bulk route assignment initiated for ${selectedVehicleIds.length} vehicles.`);
        }}
        onBulkAssignDriver={() => {
          showToast(`✓ Bulk driver assignment dialog opened.`);
        }}
        onBulkChangeStatus={() => {
          showToast(`✓ Bulk status update dialog ready.`);
        }}
        onBulkScheduleMaintenance={() => {
          showToast(`✓ Maintenance tickets drafted for selected vehicles.`);
        }}
        onBulkExport={() => handleExport('csv')}
      />

      {/* 7. GLOBAL COMMAND PALETTE MODAL (Ctrl + K) */}
      <VehicleCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        busFleet={busFleet}
        routes={routes}
        crewMembers={crewMembers}
        onSelectVehicle={(v) => setSelectedDrawerVehicle(v)}
        onAddVehicle={() => { setEditTargetVehicle(null); setIsAddEditModalOpen(true); }}
        onOpenMap={() => setInternalTab('livestatus')}
        onOpenMaintenance={() => setInternalTab('maintenance')}
        onOpenCompliance={() => setInternalTab('documents')}
        onOpenDispatch={() => setIsDispatchModalOpen(true)}
        onExportCSV={() => handleExport('csv')}
      />

      {/* 8. FLEET READINESS SCORE BREAKDOWN MODAL */}
      <FleetReadinessModal
        isOpen={isReadinessModalOpen}
        onClose={() => setIsReadinessModalOpen(false)}
        busFleet={busFleet}
        crewMembers={crewMembers}
      />

      {/* 9. DISPATCH WIZARD MODAL */}
      <VehicleDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        busFleet={busFleet}
        routes={routes}
        crewMembers={crewMembers}
        selectedVehicle={dispatchTargetVehicle}
        onConfirmDispatch={handleSaveAssignment}
      />

      {/* 10. VEHICLE DETAILS DRAWER (Slide-over) */}
      <VehicleDetailsDrawer
        vehicle={selectedDrawerVehicle}
        onClose={() => setSelectedDrawerVehicle(null)}
        onEditVehicle={(v) => {
          setSelectedDrawerVehicle(null);
          setEditTargetVehicle(v);
          setIsAddEditModalOpen(true);
        }}
        onAssignVehicle={(v) => {
          setSelectedDrawerVehicle(null);
          setAssignTargetVehicle(v);
          setIsAssignModalOpen(true);
        }}
        onScheduleMaintenance={(v) => {
          setSelectedDrawerVehicle(null);
          setMaintenanceTargetVehicle(v);
          setIsMaintenanceModalOpen(true);
        }}
        onOpenFullProfile={(v) => {
          setSelectedDrawerVehicle(null);
          setFullProfileVehicle(v);
        }}
      />

      {/* 11. FULL VEHICLE PROFILE MODAL */}
      <VehicleFullProfileModal
        vehicle={fullProfileVehicle}
        onClose={() => setFullProfileVehicle(null)}
        onEditVehicle={(v) => {
          setFullProfileVehicle(null);
          setEditTargetVehicle(v);
          setIsAddEditModalOpen(true);
        }}
        onAssignVehicle={(v) => {
          setFullProfileVehicle(null);
          setAssignTargetVehicle(v);
          setIsAssignModalOpen(true);
        }}
        onScheduleMaintenance={(v) => {
          setFullProfileVehicle(null);
          setMaintenanceTargetVehicle(v);
          setIsMaintenanceModalOpen(true);
        }}
        trips={trips}
      />

      {/* 12. ADD / EDIT VEHICLE MODAL */}
      <AddEditVehicleModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditTargetVehicle(null);
        }}
        onSave={handleSaveVehicle}
        editVehicle={editTargetVehicle}
        existingVehicles={busFleet}
      />

      {/* 13. ASSIGN VEHICLE MODAL */}
      <VehicleAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignTargetVehicle(null);
        }}
        vehicle={assignTargetVehicle}
        routes={routes}
        crewMembers={crewMembers}
        allVehicles={busFleet}
        onSaveAssignment={handleSaveAssignment}
      />

      {/* 14. SCHEDULE MAINTENANCE MODAL */}
      <ScheduleMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setMaintenanceTargetVehicle(null);
        }}
        vehicle={maintenanceTargetVehicle}
        onSaveMaintenance={handleSaveMaintenance}
      />

      {/* 15. TOAST FEEDBACK NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[3000] bg-card border border-border text-foreground px-4 py-3 rounded-xl font-mono text-xs flex items-center space-x-2 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
