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
  Columns
} from 'lucide-react';

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
  let activeFeature = 'overview';
  if (path.includes('/vehicles/fleet')) activeFeature = 'fleet';
  else if (path.includes('/vehicles/livestatus')) activeFeature = 'livestatus';
  else if (path.includes('/vehicles/assignments')) activeFeature = 'assignments';
  else if (path.includes('/vehicles/availability')) activeFeature = 'availability';
  else if (path.includes('/vehicles/maintenance')) activeFeature = 'maintenance';
  else if (path.includes('/vehicles/documents')) activeFeature = 'documents';

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

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // Column Visibility Configuration
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
  const [selectedDrawerVehicle, setSelectedDrawerVehicle] = useState(null);
  const [fullProfileVehicle, setFullProfileVehicle] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editTargetVehicle, setEditTargetVehicle] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetVehicle, setAssignTargetVehicle] = useState(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceTargetVehicle, setMaintenanceTargetVehicle] = useState(null);

  // Live Status View Mode (table | map | split)
  const [liveViewMode, setLiveViewMode] = useState('split');

  // Refresh feedback
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
      showToast('✓ Live fleet telemetry & GPS synchronized with transit server.');
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

  // Filtered & Sorted Vehicles (Single Source of Truth)
  const filteredVehicles = useMemo(() => {
    return busFleet.filter(bus => {
      // Search match
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

      // Status match
      const matchesStatus = 
        filters.status === 'ALL' || 
        bus.status === filters.status ||
        (filters.status === 'STANDBY_READY' && (bus.status === 'AVAILABLE' || bus.status === 'STANDBY_READY'));

      // Fuel / Type match
      const matchesFuel = 
        filters.fuelType === 'ALL' || 
        bus.fuelType === filters.fuelType;

      // Depot match
      const matchesDepot = 
        filters.depot === 'ALL' || 
        bus.depot === filters.depot;

      // Battery match
      let matchesBattery = true;
      if (filters.battery === 'CRITICAL') matchesBattery = bus.batteryPct <= 20;
      else if (filters.battery === 'LOW') matchesBattery = bus.batteryPct > 20 && bus.batteryPct <= 50;
      else if (filters.battery === 'NORMAL') matchesBattery = bus.batteryPct > 50;

      // Maintenance match
      let matchesMaint = true;
      if (filters.maintenance === 'DUE_THIS_WEEK') {
        matchesMaint = bus.nextServiceDate && (new Date(bus.nextServiceDate) - new Date() < 15 * 86400000);
      } else if (filters.maintenance === 'HEALTHY') {
        matchesMaint = bus.status !== 'MAINTENANCE';
      }

      // GPS match
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

  // Export Filtered Results
  const handleExport = (format) => {
    const exportData = filteredVehicles.map(v => ({
      AssetID: v.id,
      Registration: v.busNumber,
      Type: v.type,
      Depot: v.depot || 'Kashmere Gate ISBT',
      Route: v.assignedRoute || 'Unassigned',
      Driver: v.assignedDriver || 'Unassigned',
      Status: v.status,
      Battery: `${v.batteryPct}%`,
      Speed: `${v.speedKmH} km/h`,
      Odometer: v.odometerKm,
      NextService: v.nextServiceDate
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {}).join(',');
      const rows = exportData.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
      const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `cityflow_fleet_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Exported ${exportData.length} filtered vehicle records to CSV.`);
    } else if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const link = document.createElement('a');
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `cityflow_fleet_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Exported ${exportData.length} records to JSON.`);
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
    showToast(`✓ Work Order scheduled for ${maintenanceData.vehicleId} at ${maintenanceData.workshop}`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto font-sans text-foreground">
      
      {/* 1. UPGRADED OPERATIONAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          {/* Subtle Breadcrumb */}
          <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider font-semibold">
            ADMIN / VEHICLES / {activeFeature.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
            Fleet &amp; Vehicle Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor vehicle availability, assignments, telemetry, and maintenance.
          </p>
        </div>

        {/* Live Synchronization Tag & Header CTAs */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">LIVE</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-foreground">Updated 12 sec ago</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-muted/50 transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 rounded-md bg-card border border-border text-foreground hover:bg-muted/50 transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setEditTargetVehicle(null);
              setIsAddEditModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:opacity-90 transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC FLEET STATISTICS (Filter-on-click) */}
      <FleetKPICards
        busFleet={busFleet}
        activeFilter={filters.status}
        onSelectFilter={(statusKey) => handleFilterChange('status', statusKey)}
      />

      {/* 3. FLEET HEALTH OVERVIEW (Segmented Bar) */}
      <FleetHealth
        busFleet={busFleet}
        onSelectStatus={(statusKey) => handleFilterChange('status', statusKey)}
      />

      {/* 4. SUB-FEATURE VIEW ROUTING & CONTENT */}
      
      {/* VIEW A: OVERVIEW & FLEET TABLE */}
      {(activeFeature === 'overview' || activeFeature === 'fleet') && (
        <div className="space-y-4">
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
            totalResults={filteredVehicles.length}
            isRefreshing={isRefreshing}
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

      {/* VIEW B: LIVE STATUS (Telemetry Grid + Map Split View) */}
      {activeFeature === 'livestatus' && (
        <div className="space-y-4">
          
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-xs font-mono text-xs">
            <div className="flex items-center space-x-2 text-foreground font-bold">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Real-Time Vehicle Telemetry &amp; GPS Spatial Tracking</span>
            </div>

            <div className="flex items-center space-x-1 bg-muted/40 p-0.5 rounded border border-border">
              <button
                onClick={() => setLiveViewMode('split')}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  liveViewMode === 'split' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setLiveViewMode('map')}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  liveViewMode === 'map' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                Full Map
              </button>
              <button
                onClick={() => setLiveViewMode('table')}
                className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                  liveViewMode === 'table' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                Telemetry Grid
              </button>
            </div>
          </div>

          {/* View Mode Content */}
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

              <div className="lg:col-span-5 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {busFleet.map(bus => (
                  <div
                    key={bus.id}
                    onClick={() => setSelectedDrawerVehicle(bus)}
                    className="p-3.5 bg-card border border-border rounded-lg hover:border-foreground/30 transition cursor-pointer space-y-2 font-mono text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{bus.busNumber}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {bus.speedKmH > 0 ? `${bus.speedKmH} km/h (In Transit)` : 'Idle at Hub'}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px] flex justify-between">
                      <span>Route {bus.assignedRoute || 'Unassigned'}</span>
                      <span>Battery: <strong className="text-foreground">{bus.batteryPct}%</strong></span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Driver: {bus.assignedDriver || 'Standby Pool'} • Depot: {bus.depot || 'Kashmere Gate'}
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
                  className="p-4 bg-card border border-border rounded-lg shadow-xs space-y-3 hover:border-foreground/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-base text-foreground">{bus.busNumber}</div>
                      <div className="text-[11px] text-muted-foreground">{bus.id} • {bus.type}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      {bus.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded border border-border text-center">
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

                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>Route: <strong className="text-primary">{bus.assignedRoute || 'Depot'}</strong></span>
                    <span>Driver: <strong className="text-foreground">{bus.assignedDriver || 'None'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* VIEW C: ASSIGNMENTS */}
      {activeFeature === 'assignments' && (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold font-sans text-foreground">
                Vehicle → Driver → Route Assignment Roster
              </h2>
              <p className="text-xs text-muted-foreground font-sans">
                Review and modify bus allocations across transit routes and driver shifts.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {busFleet.map(bus => (
              <div key={bus.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded transition">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{bus.busNumber}</div>
                    <div className="text-[10px] text-muted-foreground">{bus.id} • {bus.type} ({bus.capacity} Seats)</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="px-3 py-1.5 rounded bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Route: </span>
                    <strong className="text-primary">{bus.assignedRoute ? `Route ${bus.assignedRoute}` : 'Unassigned'}</strong>
                  </div>

                  <div className="px-3 py-1.5 rounded bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Driver: </span>
                    <strong className="text-foreground">{bus.assignedDriver || 'Depot Standby'}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setAssignTargetVehicle(bus);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:opacity-90 transition cursor-pointer"
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
      {activeFeature === 'availability' && (
        <VehicleAvailabilityTimeline
          busFleet={busFleet}
          onOpenVehicleDrawer={(bus) => setSelectedDrawerVehicle(bus)}
        />
      )}

      {/* VIEW E: MAINTENANCE WORKSHOP QUEUE */}
      {activeFeature === 'maintenance' && (
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

      {/* VIEW F: COMPLIANCE & DOCUMENTS */}
      {activeFeature === 'documents' && (
        <VehicleDocumentsView busFleet={busFleet} />
      )}

      {/* 5. FLOATING BULK ACTIONS BAR */}
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

      {/* 6. VEHICLE DETAILS DRAWER (Slide-over) */}
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

      {/* 7. FULL VEHICLE PROFILE MODAL */}
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

      {/* 8. ADD / EDIT VEHICLE MODAL */}
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

      {/* 9. ASSIGN VEHICLE MODAL */}
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

      {/* 10. SCHEDULE MAINTENANCE MODAL */}
      <ScheduleMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => {
          setIsMaintenanceModalOpen(false);
          setMaintenanceTargetVehicle(null);
        }}
        vehicle={maintenanceTargetVehicle}
        onSaveMaintenance={handleSaveMaintenance}
      />

      {/* 11. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[3000] bg-card border-2 border-primary text-foreground px-4 py-3 rounded-lg font-mono text-xs flex items-center space-x-2 shadow-2xl animate-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
